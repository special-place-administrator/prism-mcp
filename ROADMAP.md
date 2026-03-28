# Prism MCP — Roadmap

> Full project board: https://github.com/users/dcostenco/projects/1/views/1

---

## 🏆 Shipped — The v4.x Lineage

Prism has evolved from a simple SQLite session logger into a **Quantized, Multimodal, Multi-Agent, Self-Learning, Observable AI Operating System**.

### ✅ v5.2.0 — Cognitive Memory & Universal Migration

| Feature | Detail |
|---------|--------|
| 🧠 **Ebbinghaus Importance Decay** | `effective_importance = base × 0.95^days` at retrieval time. Frequently accessed memories stay prominent; neglected ones fade naturally. |
| 🎯 **Context-Weighted Retrieval** | `context_boost` parameter on `session_search_memory` prepends project context to query before embedding — biases results toward current work. |
| 🔄 **Universal History Migration** | Strategy Pattern adapters for Claude Code (JSONL), Gemini (StreamArray), OpenAI (JSON). `p-limit(5)` concurrency, content-hash dedup, `--dry-run`. |
| 🧹 **Smart Consolidation** | Enhanced compaction prompts extract recurring principles alongside summaries. |
| 🛡️ **SQL Injection Prevention** | 17-column allowlist on `patchLedger()` blocks column-name injection. |

---

### ✅ v5.1.0 — Knowledge Graph Editor & Deep Storage

| Feature | Detail |
|---------|--------|
| 🗑️ **Deep Storage Mode** | `prism_purge_embeddings` reclaims ~90% of vector storage by purging float32 vectors for entries with TurboQuant blobs. |
| 🕸️ **Knowledge Graph Editor** | Graph filtering (project, date range, importance) and interactive node editor panel to surgically rename/delete keywords. |

---

### ✅ v5.0.0 — Quantized Agentic Memory

| Feature | Detail |
|---------|--------|
| 🧮 **TurboQuant Math Core** | Pure TypeScript port of Google's TurboQuant (ICLR 2026) — Lloyd-Max codebook, QR rotation, QJL error correction. Zero dependencies. |
| 📦 **~7× Embedding Compression** | 768-dim embeddings shrink from 3,072 bytes to ~400 bytes (4-bit) via variable bit-packing. |
| 🔍 **Asymmetric Similarity** | Unbiased inner product estimator: query as float32 vs compressed blobs. No decompression needed. |
| 🗄️ **Three-Tier Search** | FTS5 → sqlite-vec float32 → TurboQuant JS fallback. Search works even without native vector extension. |
| 🛠️ **Backfill Handler** | `session_backfill_embeddings` repairs AND compresses existing entries in a single atomic update. |

---

### ✅ v4.6.0 — OpenTelemetry Observability

| Feature | Detail |
|---------|--------|
| 🔭 **MCP Root Span** | `mcp.call_tool` wraps every tool invocation. Context propagated via AsyncLocalStorage — no ref-passing. |
| 🎨 **TracingLLMProvider** | Decorator at the factory boundary. Zero changes to vendor adapters (Gemini/OpenAI/Anthropic). Instruments text, embedding, and VLM generation. |
| ⚙️ **Worker Spans** | `worker.vlm_caption` in `imageCaptioner.ts` correctly parents fire-and-forget async tasks to the root MCP span. |
| 🔒 **Shutdown Flush** | `shutdownTelemetry()` is step-0 in `lifecycle.ts` — flushes `BatchSpanProcessor` before DBs close on SIGTERM/disconnect. |
| 🖥️ **Dashboard UI** | 🔭 Observability tab: enable toggle, OTLP endpoint, service name, inline Jaeger docker quick-start, ASCII waterfall diagram. |
| ✅ **GDPR-safe** | Span attributes: char counts + sizes only. Never prompt content, embeddings, or base64 image data. |

**Trace waterfall:**
```
mcp.call_tool  [session_save_image, ~50 ms]
  └─ worker.vlm_caption          [~2–5 s, outlives parent ✓]
       └─ llm.generate_image_description  [~1–4 s]
       └─ llm.generate_embedding          [~200 ms]
```

---

### ✅ v4.5.1 — GDPR Export & Test Hardening

| Feature | Detail |
|---------|--------|
| 📦 **`session_export_memory`** | ZIP export of all project memory (JSON + Markdown). Satisfies GDPR Art. 20 Right to Portability. API keys redacted, embeddings stripped. |
| 🧪 **270 Tests** | Concurrent export safety, API-key redaction edge cases (incl. `db_password` non-redaction regression), MCP contract under concurrent load. |

---

### ✅ v4.5.0 — VLM Multimodal Memory

| Feature | Detail |
|---------|--------|
| 👁️ **Auto-Captioning Pipeline** | `session_save_image` → VLM → handoff visual_memory → ledger entry → inline embedding. Fire-and-forget, never blocks MCP response. |
| 🔍 **Free Semantic Search** | Captions stored as standard ledger entries — `session_search_memory` finds images by meaning with zero schema changes. |
| 🛡️ **Provider Size Guards** | Anthropic 5MB hard cap. Gemini/OpenAI 20MB soft cap. Pre-flight check before API call. |
| 🔄 **OCC Retry on Handoff** | Read-modify-write with 2-attempt OCC retry loop to survive concurrent handoff saves. |

---

### ✅ v4.4.0 — Pluggable LLM Adapters (BYOM)

| Feature | Detail |
|---------|--------|
| 🔌 **Provider Adapters** | OpenAI, Anthropic Claude, Gemini, Ollama (local). Split provider: text and embedding independently configurable. |
| 🛡️ **Air-Gapped Mode** | Zero cloud API keys — full local execution via `http://127.0.0.1:11434`. |
| 🔀 **Cost-Optimized** | Claude 3.5 Sonnet + `nomic-embed-text` (free, local) = best-in-class reasoning + free embeddings. |

---

### ✅ v4.3.0 — The Bridge: Knowledge Sync Rules

Active Behavioral Memory meets IDE context. Graduated insights (importance ≥ 7) auto-sync into `.cursorrules` / `.clauderules` via `knowledge_sync_rules` — idempotent sentinel-based file writing.

---

### ✅ v4.2.0 — Project Repo Registry

Dashboard UI maps projects to repo directories. `session_save_ledger` validates `files_changed` paths and warns on mismatch. Dynamic tool descriptions replace `PRISM_AUTOLOAD_PROJECTS` env var — dashboard is sole source of truth.

---

### ✅ v4.1.0 — Auto-Migration & Multi-Instance

Zero-config Supabase schema upgrades via `prism_apply_ddl` RPC on startup. `PRISM_INSTANCE` env var for side-by-side server instances without PID lock conflicts.

---

### ✅ v4.0.0 — Behavioral Memory

`session_save_experience` with event types, confidence scores, and importance decay. Auto-injects correction warnings into `session_load_context`. Dynamic role resolution from dashboard.

---

### ✅ v3.x — Memory Lifecycle & Agent Hivemind

v3.1: Data retention (TTL), auto-compaction, PKM export, analytics sparklines.  
v3.0: Role-scoped memory, agent registration/heartbeat, Telepathy (real-time cross-agent sync).

---

## 📊 The State of Prism (v5.2)

With v5.2 shipped, Prism has crossed from retrieval into **cognition**:

- **Cognitive** — Ebbinghaus decay + context-boosted retrieval = memory that knows what matters *right now*.
- **Zero Cold-Start** — Universal Migration imports years of Claude/Gemini/ChatGPT history on day one.
- **Scale** — TurboQuant 10× compression + Deep Storage Purge. Decades of session history on a laptop.
- **Quality** — Interactive Knowledge Graph Editor + Behavioral Memory that learns from mistakes.
- **Reliability** — 352 passing tests across 15 suites. Hardened auto-load hooks for Claude Code & Gemini.
- **Observability** — OpenTelemetry span waterfalls for every tool call, LLM hop, and background worker.
- **Multimodal** — VLM auto-captioning turns screenshots into semantically searchable memory.
- **Security** — SQL injection prevention via column allowlists on all dynamic query paths.

---

### ✅ v5.4.0 — Concurrency, Automation & Autonomous Research

| Feature | Detail |
|---------|--------|
| 🔄 **CRDT Handoff Merging** | Custom OR-Map engine replaces strict OCC rejection. Add-Wins OR-Set for arrays (`open_todos`), Last-Writer-Wins for scalars. 3-way merge via `getHandoffAtVersion()`. `disable_merge` bypass for strict mode. |
| ⏰ **Background Purge Scheduler** | Unified `setInterval` loop (default: 12h) runs TTL sweep, importance decay, auto-compaction, and deep storage purge. Dashboard status card. `PRISM_SCHEDULER_ENABLED` / `PRISM_SCHEDULER_INTERVAL_MS`. |
| 🌐 **Autonomous Web Scholar** | Brave Search → Firecrawl scrape → LLM synthesis → Prism ledger injection. Task-aware topic selection biases toward active Hivemind agent tasks. Reentrancy guard, 15K content cap, configurable schedule. |
| 🐝 **Scholar ↔ Hivemind** | Scholar registers as `scholar` role, emits pipeline-stage heartbeats, broadcasts Telepathy alerts on completion. Zero overhead when Hivemind is off. |
| 📖 **Architecture Docs** | 3 new sections in `docs/ARCHITECTURE.md` with mermaid diagrams covering Hivemind, Scheduler, and Scholar. |

---

## 🗺️ Next on the Horizon — v5.5

The next major frontier: **Mobile & Advanced Cognition**.

### 📱 Mind Palace Mobile PWA

**Problem:** The dashboard is desktop-only. Quick check-ins on mobile require a laptop.

**Solution:** Progressive Web App with responsive glassmorphism layout, offline-first IndexedDB cache, and push notifications for agent activity.

**Phases:**
1. Responsive CSS breakpoints for the existing dashboard
2. Service worker + offline cache for read-only access
3. Push notifications via Web Push API for Telepathy events

### 🧠 Superposed Memory (SDM)

**Problem:** Semantic search requires embedding every query and scanning all vectors — O(n) at scale.

**Solution:** Sparse Distributed Memory (Kanerva, 1988) — store patterns in a superposed address space for O(1) retrieval via correlation. No index, no ANN, just ask the vector.

---

## 🧰 Infrastructure Backlog

| Feature | Notes |
|---------|-------|
| Supabase RPC Soft-Delete Filtering | Server-side GDPR filtering at the RPC layer |
| Prism CLI | Standalone CLI for backup, export, and health check without MCP |
| Plugin System | Third-party tool registration via MCP tool composition |
