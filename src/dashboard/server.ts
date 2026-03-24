/**
 * Mind Palace Dashboard — HTTP Server (v2.0 — Step 8)
 *
 * Zero-dependency HTTP server serving the Prism Mind Palace UI.
 * Runs alongside the MCP stdio server on a separate port.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CRITICAL MCP SAFETY:
 *   The MCP server communicates via stdout. ANY console.log() here
 *   will corrupt the JSON-RPC stream and crash the agent.
 *   All logging uses console.error() exclusively.
 *
 * ENDPOINTS:
 *   GET /                   → Dashboard UI (HTML)
 *   GET /api/projects       → List all projects with handoff data
 *   GET /api/project?name=  → Full project data (context, ledger, history)
 * ═══════════════════════════════════════════════════════════════════
 */

import * as http from "http";
import { exec } from "child_process";
import { getStorage } from "../storage/index.js";
import { PRISM_USER_ID, SERVER_CONFIG } from "../config.js";
import { renderDashboardHTML } from "./ui.js";
import { getAllSettings, setSetting, getSetting } from "../storage/configStorage.js";
import { compactLedgerHandler } from "../tools/compactionHandler.js";


const PORT = parseInt(process.env.PRISM_DASHBOARD_PORT || "3000", 10);

/** Read HTTP request body as string */
function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => { data += chunk; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/**
 * Kill any existing process holding the dashboard port.
 * This prevents zombie dashboard processes from surviving IDE restarts
 * and serving stale versions of the UI.
 *
 * CRITICAL: Uses async exec() instead of execSync() to avoid blocking
 * the Node.js event loop. Blocking during startup prevents the MCP
 * stdio transport from responding to the initialize handshake in time,
 * causing Antigravity to report MCP_SERVER_INIT_ERROR.
 */
async function killPortHolder(port: number): Promise<void> {
  return new Promise((resolve) => {
    exec(`lsof -ti tcp:${port}`, { encoding: "utf-8" }, (err, stdout) => {
      if (err) {
        // lsof exits with code 1 when no matches found — that's expected.
        // Any other failure (lsof missing, permission denied, etc.) gets a warning.
        const isNoMatch = err.code === 1;
        if (!isNoMatch) {
          console.error(
            `[Dashboard] killPortHolder: could not check port ${port} (lsof may not be installed) — skipping.`
          );
        }
        return resolve();
      }

      const pids = stdout.trim().split("\n").filter(Boolean);
      if (pids.length === 0) return resolve();

      // Don't kill ourselves
      const myPid = String(process.pid);
      const stalePids = pids.filter(p => p !== myPid);

      if (stalePids.length > 0) {
        console.error(`[Dashboard] Killing stale process(es) on port ${port}: ${stalePids.join(", ")}`);
        exec(`kill ${stalePids.join(" ")}`, () => {
          // Brief pause to let the OS release the port
          setTimeout(resolve, 300);
        });
      } else {
        resolve();
      }
    });
  });
}

export async function startDashboardServer(): Promise<void> {
  // Fire-and-forget port cleanup — don't block server start.
  // Previously awaiting this added 300ms+ delay from lsof + setTimeout,
  // starving the MCP stdio transport during the init handshake.
  killPortHolder(PORT).catch(() => {});

  // Lazy storage accessor — returns null if storage isn't ready yet.
  // API routes gracefully degrade with 503 instead of blocking startup.
  let _storage: Awaited<ReturnType<typeof getStorage>> | null = null;
  const getStorageSafe = async (): Promise<Awaited<ReturnType<typeof getStorage>> | null> => {
    if (_storage) return _storage;
    try {
      _storage = await getStorage();
      return _storage;
    } catch {
      return null;
    }
  };

  const httpServer = http.createServer(async (req, res) => {
    // CORS headers for local dev
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    try {
      const url = new URL(req.url || "/", `http://${req.headers.host}`);

      // ─── Serve the Dashboard UI ───
      if (url.pathname === "/" || url.pathname === "/index.html") {
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        });
        return res.end(renderDashboardHTML(SERVER_CONFIG.version));
      }

      // ─── API: List all projects ───
      if (url.pathname === "/api/projects") {
        const s = await getStorageSafe();
        if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
        const projects = await s.listProjects();
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ projects }));
      }

      // ─── API: Get full project data ───
      if (url.pathname === "/api/project") {
        const projectName = url.searchParams.get("name");
        if (!projectName) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Missing ?name= parameter" }));
        }

        const s = await getStorageSafe();
        if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
        const context = await s.loadContext(projectName, "deep", PRISM_USER_ID);
        const ledger = await s.getLedgerEntries({
          project: `eq.${projectName}`,
          order: "created_at.desc",
          limit: "20",
        });
        let history: unknown[] = [];
        try {
          history = await s.getHistory(projectName, PRISM_USER_ID, 10);
        } catch {
          // History may not exist for all projects
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ context, ledger, history }));
      }

      // ─── API: Brain Health Check (v2.2.0) ───
      if (url.pathname === "/api/health" && req.method === "GET") {
        try {
          const { runHealthCheck } = await import("../utils/healthCheck.js");
          const s = await getStorageSafe();
          if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
          const stats = await s.getHealthStats(PRISM_USER_ID);
          const report = runHealthCheck(stats);
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify(report));
        } catch (err) {
          console.error("[Dashboard] Health check error:", err);
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            status: "unknown",
            summary: "Health check unavailable",
            issues: [],
            counts: { errors: 0, warnings: 0, infos: 0 },
            totals: { activeEntries: 0, handoffs: 0, rollups: 0 },
            timestamp: new Date().toISOString(),
          }));
        }
      }

      // ─── API: Brain Health Cleanup (v3.1) ───
      // Deletes orphaned handoffs (handoffs with no backing ledger entries).
      if (url.pathname === "/api/health/cleanup" && req.method === "POST") {
        try {
          const { runHealthCheck } = await import("../utils/healthCheck.js");
          const s = await getStorageSafe();
          if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
          const stats = await s.getHealthStats(PRISM_USER_ID);
          const report = runHealthCheck(stats);

          // Collect orphaned handoff projects from the health issues
          const orphaned = stats.orphanedHandoffs || [];
          const cleaned: string[] = [];

          for (const { project } of orphaned) {
            try {
              await s.deleteHandoff(project, PRISM_USER_ID);
              cleaned.push(project);
              console.error(`[Dashboard] Cleaned up orphaned handoff: ${project}`);
            } catch (delErr) {
              console.error(`[Dashboard] Failed to delete handoff for ${project}:`, delErr);
            }
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            ok: true,
            cleaned,
            count: cleaned.length,
            message: cleaned.length > 0
              ? `Cleaned up ${cleaned.length} orphaned handoff(s): ${cleaned.join(", ")}`
              : "No orphaned handoffs to clean up.",
          }));
        } catch (err) {
          console.error("[Dashboard] Health cleanup error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ ok: false, error: "Cleanup failed" }));
        }
      }

      // ─── API: Role-Scoped Skills (v3.1) ───

      // GET /api/skills → { skills: { dev: "...", qa: "..." } }
      if (url.pathname === "/api/skills" && req.method === "GET") {
        const all = await getAllSettings();
        const skills: Record<string, string> = {};
        for (const [k, v] of Object.entries(all)) {
          if (k.startsWith("skill:") && v) {
            skills[k.replace("skill:", "")] = v;
          }
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ skills }));
      }

      // POST /api/skills → { role, content } saves skill:<role>
      if (url.pathname === "/api/skills" && req.method === "POST") {
        const body = await new Promise<string>(resolve => {
          let data = ""; req.on("data", c => data += c); req.on("end", () => resolve(data));
        });
        const { role, content } = JSON.parse(body || "{}");
        if (!role) { res.writeHead(400); return res.end(JSON.stringify({ error: "role required" })); }
        await setSetting(`skill:${role}`, content || "");
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ ok: true, role }));
      }

      // DELETE /api/skills/:role → clears skill:<role>
      if (url.pathname.startsWith("/api/skills/") && req.method === "DELETE") {
        const role = url.pathname.replace("/api/skills/", "");
        await setSetting(`skill:${role}`, "");
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ ok: true, role }));
      }

      // ─── API: Knowledge Graph Data (v2.3.0) ───
      if (url.pathname === "/api/graph") {
        // Fetch recent ledger entries to build the graph
        // We look at the last 100 entries to keep the graph relevant but performant
        const s = await getStorageSafe();
        if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
        const entries = await s.getLedgerEntries({
          limit: "100",
          order: "created_at.desc",
          select: "project,keywords",
        });

        // Deduplication sets for nodes and edges
        const nodes: { id: string; label: string; group: string }[] = [];
        const edges: { from: string; to: string }[] = [];
        const nodeIds = new Set<string>();   // track unique node IDs
        const edgeIds = new Set<string>();   // track unique edges

        // Helper: add a node only if it doesn't already exist
        const addNode = (id: string, group: string, label?: string) => {
          if (!nodeIds.has(id)) {
            nodes.push({ id, label: label || id, group });
            nodeIds.add(id);
          }
        };

        // Helper: add an edge only if it doesn't already exist
        const addEdge = (from: string, to: string) => {
          const id = `${from}-${to}`;  // deterministic edge ID
          if (!edgeIds.has(id)) {
            edges.push({ from, to });
            edgeIds.add(id);
          }
        };

        // Transform relational data into graph nodes & edges
        (entries as any[]).forEach(row => {
          if (!row.project) return;  // skip rows without project

          // 1. Project node (hub — large purple dot)
          addNode(row.project, "project");

          // 2. Keyword nodes (spokes — small dots)
          let keywords: string[] = [];

          // Handle SQLite (JSON string) vs Supabase (native array)
          if (Array.isArray(row.keywords)) {
            keywords = row.keywords;
          } else if (typeof row.keywords === "string") {
            try { keywords = JSON.parse(row.keywords); } catch { /* skip malformed */ }
          }

          // Create nodes + edges for each keyword
          keywords.forEach((kw: string) => {
            if (kw.length < 3) return;  // skip noise like "a", "is"

            // Handle categories (cat:debugging) vs raw keywords
            const isCat = kw.startsWith("cat:");
            const group = isCat ? "category" : "keyword";
            const label = isCat ? kw.replace("cat:", "") : kw;

            addNode(kw, group, label);  // keyword/category node
            addEdge(row.project, kw);   // edge: project → keyword
          });
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ nodes, edges }));
      }

      // ─── API: Hivemind Team Roster (v3.0) ───
      if (url.pathname === "/api/team") {
        const projectName = url.searchParams.get("project");
        if (!projectName) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Missing ?project= parameter" }));
        }
        try {
          const s = await getStorageSafe();
          if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
          const team = await s.listTeam(projectName, PRISM_USER_ID);
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ team }));
        } catch {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ team: [] }));
        }
      }

      // ─── API: Settings — GET (v3.0 Dashboard Settings) ───
      if (url.pathname === "/api/settings" && req.method === "GET") {
        try {
          const { getAllSettings } = await import("../storage/configStorage.js");
          const settings = await getAllSettings();
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ settings }));
        } catch {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ settings: {} }));
        }
      }

      // ─── API: Settings — POST (v3.0 Dashboard Settings) ───
      if (url.pathname === "/api/settings" && req.method === "POST") {
        try {
          const body = await readBody(req);
          const parsed = JSON.parse(body);
          if (parsed.key && parsed.value !== undefined) {
            const { setSetting } = await import("../storage/configStorage.js");
            await setSetting(parsed.key, String(parsed.value));
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ ok: true, key: parsed.key, value: parsed.value }));
          }
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Missing key or value" }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid JSON body" }));
        }

      }

      // ─── API: Memory Analytics (v3.1) ────────────────────
      if (url.pathname === "/api/analytics" && req.method === "GET") {
        const projectName = url.searchParams.get("project");
        if (!projectName) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Missing ?project= parameter" }));
        }
        try {
          const s = await getStorageSafe();
          if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
          const analytics = await s.getAnalytics(projectName, PRISM_USER_ID);
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify(analytics));
        } catch (err) {
          console.error("[Dashboard] Analytics error:", err);
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            totalEntries: 0, totalRollups: 0, rollupSavings: 0,
            avgSummaryLength: 0, sessionsByDay: [],
          }));
        }
      }

      // ─── API: Retention (TTL) Settings (v3.1) ──────────────
      // GET /api/retention?project= → current TTL setting
      // POST /api/retention → { project, ttl_days } → saves + runs sweep
      if (url.pathname === "/api/retention") {
        if (req.method === "GET") {
          const projectName = url.searchParams.get("project");
          if (!projectName) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Missing ?project= parameter" }));
          }
          const ttlRaw = await getSetting(`ttl:${projectName}`, "0");
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ project: projectName, ttl_days: parseInt(ttlRaw, 10) || 0 }));
        }

        if (req.method === "POST") {
          const body = await readBody(req);
          const { project, ttl_days } = JSON.parse(body || "{}");
          if (!project || ttl_days === undefined) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "project and ttl_days required" }));
          }
          if (ttl_days > 0 && ttl_days < 7) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Minimum TTL is 7 days" }));
          }
          await setSetting(`ttl:${project}`, String(ttl_days));
          let expired = 0;
          if (ttl_days > 0) {
            const s = await getStorageSafe();
            if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
            const result = await s.expireByTTL(project, ttl_days, PRISM_USER_ID);
            expired = result.expired;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ ok: true, project, ttl_days, expired }));
        }
      }

      // ─── API: Compact Now (v3.1 — Dashboard button) ──────────
      if (url.pathname === "/api/compact" && req.method === "POST") {
        const body = await readBody(req);
        const { project } = JSON.parse(body || "{}");
        if (!project) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "project required" }));
        }
        try {
          const result = await compactLedgerHandler({ project });
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ ok: true, result }));
        } catch (err) {
          console.error("[Dashboard] Compact error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ ok: false, error: "Compaction failed" }));
        }
      }

      // ─── API: PKM Export — Obsidian/Logseq ZIP (v3.1) ──────
      if (url.pathname === "/api/export" && req.method === "GET") {
        const projectName = url.searchParams.get("project");
        if (!projectName) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Missing ?project= parameter" }));
        }
        try {
          // Lazy-import fflate to keep startup fast
          const { strToU8, zipSync } = await import("fflate");

          // Fetch all active ledger entries for this project
          const s = await getStorageSafe();
          if (!s) { res.writeHead(503, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "Storage initializing..." })); }
          const entries = await s.getLedgerEntries({
            project: `eq.${projectName}`,
            order: "created_at.asc",
            limit: "1000",
          }) as Array<Record<string, unknown>>;

          const files: Record<string, Uint8Array> = {};

          // One MD file per session
          for (const entry of entries) {
            const date = (entry.created_at as string | undefined)?.slice(0, 10) ?? "unknown";
            const id = (entry.id as string | undefined)?.slice(0, 8) ?? "xxxxxxxx";
            const filename = `${projectName}/${date}-${id}.md`;

            const todos = Array.isArray(entry.todos) ? (entry.todos as string[]) : [];
            const decisions = Array.isArray(entry.decisions) ? (entry.decisions as string[]) : [];
            const files_changed = Array.isArray(entry.files_changed) ? (entry.files_changed as string[]) : [];
            const tags = ((Array.isArray(entry.keywords) ? entry.keywords : []) as string[]).slice(0, 10);

            const content = [
              `# Session: ${date}`,
              ``,
              `**Project:** ${projectName}`,
              `**Date:** ${date}`,
              `**Role:** ${(entry.role as string) || "global"}`,
              tags.length ? `**Tags:** ${tags.map(t => `#${t.replace(/\s+/g, "_")}`).join(" ")}` : "",
              ``,
              `## Summary`,
              ``,
              entry.summary as string,
              ``,
              todos.length ? `## TODOs\n\n${todos.map(t => `- [ ] ${t}`).join("\n")}` : "",
              decisions.length ? `## Decisions\n\n${decisions.map(d => `- ${d}`).join("\n")}` : "",
              files_changed.length ? `## Files Changed\n\n${files_changed.map(f => `- \`${f}\``).join("\n")}` : "",
            ].filter(Boolean).join("\n");

            files[filename] = strToU8(content);
          }

          // Index file linking all sessions
          const indexLines = [
            `# ${projectName} — Session Index`,
            ``,
            `> Exported from Prism MCP on ${new Date().toISOString().slice(0, 10)}`,
            ``,
            ...entries.map(e => {
              const d = (e.created_at as string | undefined)?.slice(0, 10) ?? "unknown";
              const i = (e.id as string | undefined)?.slice(0, 8) ?? "xxxxxxxx";
              return `- [[${projectName}/${d}-${i}]]`;
            }),
          ];
          files[`${projectName}/_index.md`] = strToU8(indexLines.join("\n"));

          const zipped = zipSync(files, { level: 6 });

          res.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="prism-export-${projectName}-${Date.now()}.zip"`,
            "Content-Length": String(zipped.byteLength),
          });
          return res.end(Buffer.from(zipped));
        } catch (err) {
          console.error("[Dashboard] PKM export error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Export failed" }));
        }
      }

      // ─── 404 ───
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");


    } catch (error) {
      console.error("[Dashboard] Error handling request:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  });

  // Gracefully handle port conflicts (non-fatal — MCP server keeps running)
  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[Dashboard] Port ${PORT} is in use — Mind Palace disabled. ` +
          `Set PRISM_DASHBOARD_PORT to use a different port.`
      );
    } else {
      console.error(`[Dashboard] HTTP server error: ${err.message}`);
    }
  });

  httpServer.listen(PORT, () => {
    console.error(`[Prism] 🧠 Mind Palace Dashboard → http://localhost:${PORT}`);
  });

  // ─── v3.1: TTL Sweep — runs at startup + every 12 hours ───────────
  async function runTtlSweep() {
    try {
      const allSettings = await getAllSettings();
      for (const [key, val] of Object.entries(allSettings)) {
        if (!key.startsWith("ttl:")) continue;
        const project = key.replace("ttl:", "");
        const ttlDays = parseInt(val, 10);
        if (!ttlDays || ttlDays <= 0) continue;
        const s = await getStorageSafe();
        if (!s) continue;
        const result = await s.expireByTTL(project, ttlDays, PRISM_USER_ID);
        if (result.expired > 0) {
          console.error(`[Dashboard] TTL sweep: expired ${result.expired} entries for "${project}" (ttl=${ttlDays}d)`);
        }
      }
    } catch (err) {
      console.error("[Dashboard] TTL sweep error (non-fatal):", err);
    }
  }

  // Run immediately on startup, then every 12 hours
  runTtlSweep().catch(() => {});
  setInterval(() => { runTtlSweep().catch(() => {}); }, 12 * 60 * 60 * 1000);
}

