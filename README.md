# 🧠 Prism MCP — The Mind Palace for AI Agents

[![npm version](https://img.shields.io/npm/v/prism-mcp-server?color=cb0000&label=npm)](https://www.npmjs.com/package/prism-mcp-server)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-listed-00ADD8?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTUtMTAtNXpNMiAxN2wxMCA1IDEwLTV2LTJMMTI0djJMMiA5djh6Ii8+PC9zdmc+)](https://registry.modelcontextprotocol.io)
[![Glama](https://img.shields.io/badge/Glama-listed-FF5601)](https://glama.ai/mcp/servers/dcostenco/prism-mcp)
[![Smithery](https://img.shields.io/badge/Smithery-listed-6B4FBB)](https://smithery.ai/server/prism-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

**Your AI agent forgets everything between sessions. Prism fixes that.**

One command. Persistent memory. Zero cloud dependencies.

```bash
npx -y prism-mcp-server
```

Works with **Claude Desktop · Claude Code · Cursor · Windsurf · Cline · Gemini · Antigravity** — any MCP client.

---

## Why Prism?

Every time you start a new conversation with an AI coding assistant, it starts from scratch. You re-explain your architecture, re-describe your decisions, re-list your TODOs. Hours of context — gone.

**Prism gives your agent a brain that persists.** Save what matters at the end of each session. Load it back instantly on the next one. Your agent remembers what it did, what it learned, and what's left to do.

---

## ✨ What Makes Prism Different

### 🧠 Your Agent Learns From Mistakes
When you correct your agent, Prism tracks it. Corrections accumulate **importance** over time. High-importance lessons auto-surface as warnings in future sessions — and can even sync to your `.cursorrules` file for permanent enforcement. Your agent literally gets smarter the more you use it.

### 🕰️ Time Travel
Every save creates a versioned snapshot. Made a mistake? `memory_checkout` reverts your agent's memory to any previous state — like `git revert` for your agent's brain. Full version history with optimistic concurrency control.

### 🔮 Mind Palace Dashboard
A gorgeous glassmorphism UI at `localhost:3000` that lets you see exactly what your agent is thinking:

- **Current State & TODOs** — the exact context injected into the LLM's prompt
- **Interactive Knowledge Graph** — force-directed neural graph with click-to-filter, node renaming, and surgical keyword deletion *(v5.1)*
- **Deep Storage Manager** — preview and execute vector purge operations with dry-run safety *(v5.1)*
- **Session Ledger** — full audit trail of every decision your agent has made
- **Time Travel Timeline** — browse and revert any historical handoff version
- **Visual Memory Vault** — browse VLM-captioned screenshots and auto-captured HTML states
- **Hivemind Radar** — real-time active agent roster with role, task, and heartbeat
- **Morning Briefing** — AI-synthesized action plan after 4+ hours away
- **Brain Health** — memory integrity scan with one-click auto-repair

![Mind Palace Dashboard](docs/mind-palace-dashboard.png)

### 🧬 10× Memory Compression
Powered by a pure TypeScript port of Google's TurboQuant (ICLR 2026), Prism compresses 768-dim embeddings from **3,072 bytes → ~400 bytes** — enabling decades of session history on a standard laptop. No native modules. No vector database required.

### 🐝 Multi-Agent Hivemind
Multiple agents (dev, QA, PM) can work on the same project with **role-isolated memory**. Agents discover each other automatically, share context in real-time via Telepathy sync, and see a team roster during context loading.

### 🖼️ Visual Memory
Save UI screenshots, architecture diagrams, and bug states to a searchable vault. Images are auto-captioned by a VLM (Claude Vision / GPT-4V / Gemini) and become semantically searchable across sessions.

### 🔭 Full Observability
OpenTelemetry spans for every MCP tool call, LLM hop, and background worker. Route to Jaeger, Grafana, or any OTLP collector. Configure in the dashboard — zero code changes.

### 🌐 Autonomous Web Scholar
Prism researches while you sleep. A background pipeline searches the web, scrapes articles, synthesizes findings via LLM, and injects results directly into your semantic memory — fully searchable on your next session. [Details below →](#-autonomous-web-scholar)

### 🔒 GDPR Compliant
Soft/hard delete (Art. 17), full ZIP export (Art. 20), API key redaction, per-project TTL retention, and audit trail. Enterprise-ready out of the box.

---

## 🎯 Use Cases

**Long-running feature work** — Save state at end of day, restore full context next morning. No re-explaining.

**Multi-agent collaboration** — Dev, QA, and PM agents share real-time context without stepping on each other's memory.

**Consulting / multi-project** — Switch between client projects with progressive loading: `quick` (~50 tokens), `standard` (~200), or `deep` (~1000+).

**Visual debugging** — Save UI screenshots to searchable memory. Find that CSS bug from last week by description.

**Team onboarding** — New team member's agent loads the full project history instantly.

**Behavior enforcement** — Agent corrections auto-graduate into permanent `.cursorrules` / `.clauderules` rules.

**Offline / air-gapped** — Full SQLite local mode + Ollama LLM adapter. Zero internet dependency.

**Morning Briefings** — After 4+ hours away, Prism auto-synthesizes a 3-bullet action plan from your last sessions.

---

## 🆕 What's New in v5.4

- 🔄 **CRDT Handoff Merging** — Multi-agent saves no longer reject on version conflict. A custom OR-Map engine (Add-Wins OR-Set for arrays, Last-Writer-Wins for scalars) auto-merges concurrent edits. Zero data loss, zero retries.
- ⏰ **Background Purge Scheduler** — Fully automated storage maintenance. TTL sweep, Ebbinghaus importance decay, auto-compaction, and deep storage purge run on a configurable interval (default: 12h). Dashboard shows sweep status.
- 🌐 **[Autonomous Web Scholar](#-autonomous-web-scholar)** — Agent-driven research pipeline. Brave Search → Firecrawl scrape → LLM synthesis → Prism ledger. Task-aware topic selection biases research toward active Hivemind agent tasks. [Learn more →](#-autonomous-web-scholar)
- 🐝 **Scholar ↔ Hivemind Integration** — Scholar registers on the Hivemind Radar, emits heartbeats, and broadcasts Telepathy alerts on completion.
- 🧪 **362 Tests** — Zero regressions across 16 suites.

> [Full CHANGELOG →](CHANGELOG.md) · [Architecture Deep Dive →](docs/ARCHITECTURE.md)

---

## 🌐 Autonomous Web Scholar

**Your agent researches while you sleep.**

Most AI agents only know what you tell them. Web Scholar reverses this — Prism autonomously searches the web, scrapes articles, synthesizes findings with an LLM, and injects the results directly into your semantic memory. When you start your next session, the knowledge is already there, fully searchable.

> 📖 **[Full setup guide →](docs/WEB_SCHOLAR.md)** | Copy [`.env.example`](.env.example) to get started quickly.

### Why Web Scholar?

| Problem | Without Scholar | With Scholar |
|---------|----------------|--------------|
| **Knowledge freshness** | Agent only knows training data + what you paste | Agent proactively learns from the live web |
| **Research burden** | You manually search, copy, and paste articles | Prism does it automatically on a schedule |
| **Context relevance** | Generic research, disconnected from your work | Task-aware: biases toward what your team is actively building |
| **Multi-agent awareness** | Agents work in isolation | Scholar broadcasts findings to all active Hivemind agents |

### How It Works

```mermaid
flowchart TD
    A["🎯 1. Topic Selection"] -.->|"If Hivemind: bias active tasks"| A
    A -->|"Hivemind-aware"| B["🔍 2. Web Search"]
    B -->|"Top N results"| C["📄 3. Scrape & Extract"]
    C -->|"Clean markdown"| D["🧠 4. LLM Synthesis"]
    D -->|"Research report"| E["💾 5. Memory Injection"]
    E -->|"Broadcast"| F["🐝 6. Telepathy"]

    B -.-|"Brave OR Yahoo Fallback"| B
    C -.-|"Firecrawl OR Readability"| C
    D -.-|"Gemini 2.5 Flash"| D
    E -.-|"Prism ledger, importance = 7"| E
    F -.-|"All active agents notified"| F

    style A fill:#4a9eff,color:#fff
    style B fill:#ff6b6b,color:#fff
    style C fill:#ffa502,color:#fff
    style D fill:#7c3aed,color:#fff
    style E fill:#2ed573,color:#fff
    style F fill:#ff9ff3,color:#fff
```

### Key Features

- **Task-Aware Topic Selection** — When Hivemind is enabled, Scholar checks what other agents are working on and biases research toward relevant configured topics. A dev agent working on "authentication middleware" causes Scholar to prefer researching "authentication" over random topics.
- **Reentrancy Guard** — Prevents concurrent pipeline runs. If Scholar is already researching and a second trigger fires (manual + scheduled overlap), the second call is silently skipped.
- **Cost Control** — 15K character cap per scraped article, configurable max articles per run (default: 3), and manual-only scheduling by default.
- **Hivemind Lifecycle** — Scholar registers as a `scholar` role agent, emits heartbeats at each pipeline stage (visible on Dashboard Radar), and goes idle on completion.
- **Telepathy Broadcast** — After synthesis, Scholar broadcasts to all active agents so they discover new research in their next tool response.

### Configuration

```json
{
  "env": {
    "BRAVE_API_KEY": "your-brave-key",
    "FIRECRAWL_API_KEY": "your-firecrawl-key",
    "PRISM_SCHOLAR_ENABLED": "true",
    "PRISM_SCHOLAR_INTERVAL_MS": "3600000",
    "PRISM_SCHOLAR_TOPICS": "ai,agents,mcp,authentication",
    "PRISM_SCHOLAR_MAX_ARTICLES_PER_RUN": "3"
  }
}
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PRISM_SCHOLAR_ENABLED` | `false` | Opt-in to enable the Web Scholar pipeline |
| `BRAVE_API_KEY` | `""` | Optional. Used for search. If missing, falls back to zero-config local Yahoo Search. |
| `FIRECRAWL_API_KEY` | `""` | Optional. Used for scraping. If missing, falls back to local JSDOM/Readability scraping. |
| `PRISM_SCHOLAR_INTERVAL_MS` | `0` (manual) | Auto-run interval. `3600000` = hourly, `0` = manual only |
| `PRISM_SCHOLAR_TOPICS` | `ai,agents` | Comma-separated list of research topics |
| `PRISM_SCHOLAR_MAX_ARTICLES_PER_RUN` | `3` | Max articles scraped per pipeline run |

### Performance & Test Results

| Metric | Result |
|--------|--------|
| **Test coverage** | 10 tests across 3 suites (reentrancy, topic selection, Hivemind lifecycle) |
| **Reentrancy guard** | Concurrent calls correctly rejected; lock released on both success and failure |
| **Task-aware selection** | Correctly biases toward topics matching active agent tasks |
| **Hivemind no-op** | Zero Hivemind API calls when `PRISM_ENABLE_HIVEMIND=false` |
| **Pipeline heartbeats** | Accurately reports stage: "Searching Brave", "Scraping N articles", "Synthesizing" |
| **Graceful fallback** | Zero-config Local Fallback (Yahoo+Readability) if API keys missing; Storage errors fall back to random topic (no crash) |
| **Content cap** | Articles trimmed to 15K chars — prevents runaway token costs |
| **Full suite** | 362/362 tests pass across 16 suites |

---

## 🚀 Quick Start

Add to your MCP client config (`claude_desktop_config.json`, `.cursor/mcp.json`, etc.):

```json
{
  "mcpServers": {
    "prism-mcp": {
      "command": "npx",
      "args": ["-y", "prism-mcp-server"]
    }
  }
}
```

**That's it.** Restart your client. All 30+ tools are available. Dashboard at `http://localhost:3000`.

> **Optional API keys:** `GOOGLE_API_KEY` for semantic search + Morning Briefings, `BRAVE_API_KEY` for web search. See [Environment Variables](#environment-variables).

---

## 📖 Setup Guides

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "prism-mcp": {
      "command": "npx",
      "args": ["-y", "prism-mcp-server"]
    }
  }
}
```

</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "prism-mcp": {
      "command": "npx",
      "args": ["-y", "prism-mcp-server"]
    }
  }
}
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "prism-mcp": {
      "command": "npx",
      "args": ["-y", "prism-mcp-server"]
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code + Continue / Cline</strong></summary>

Add to your Continue `config.json` or Cline MCP settings:

```json
{
  "mcpServers": {
    "prism-mcp": {
      "command": "npx",
      "args": ["-y", "prism-mcp-server"],
      "env": {
        "PRISM_STORAGE": "local",
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    }
  }
}
```

</details>

#### Migration

<details>
<summary><strong>Migrating Existing History (Claude, Gemini, OpenAI)</strong></summary>

Prism can ingest months of historical sessions from other tools to give your Mind Palace a massive head start. Import via the **CLI** or directly from the [Mind Palace Dashboard](#-mind-palace-dashboard) Import tab (file picker + manual path + dry-run toggle).

### Supported Formats
* **Claude Code** (`.jsonl` logs) — Automatically handles streaming chunk deduplication and `requestId` normalization.
* **Gemini** (JSON history arrays) — Supports large-file streaming for 100MB+ exports.
* **OpenAI** (JSON chat completion history) — Normalizes disparate tool-call structures into the unified Ledger schema.

### How to Run

**Option 1 — CLI:**

```bash
# Ingest Claude Code history
npx -y prism-mcp-server universal-import --format claude --path ~/path/to/claude_log.jsonl --project my-project

# Dry run (verify mapping without saving)
npx -y prism-mcp-server universal-import --format gemini --path ./gemini_history.json --dry-run
```

**Option 2 — Dashboard:** Open `localhost:3000`, navigate to the **Import** tab, select the format and file, and click Import. Supports dry-run preview. See the [dashboard screenshot](#-mind-palace-dashboard) above.

### Key Features
* **OOM-Safe Streaming:** Processes massive log files line-by-line using `stream-json`.
* **Idempotent Dedup:** Content-hash prevents duplicate imports on re-run (`skipCount` reported).
* **Chronological Integrity:** Uses timestamp fallbacks and `requestId` sorting to ensure your memory timeline is accurate.
* **Smart Context Mapping:** Extracts `cwd`, `gitBranch`, and tool usage patterns into searchable metadata.

</details>

<details>
<summary><strong>Claude Code — Lifecycle Hooks (Auto-Load & Auto-Save)</strong></summary>

Claude Code supports `SessionStart` and `Stop` hooks that force the agent to load/save Prism context automatically.

### 1. Create the Hook Script

Save as `~/.claude/mcp_autoload_hook.py`:

```python
#!/usr/bin/env python3
import json, sys

def main():
    print(json.dumps({
        "continue": True,
        "suppressOutput": True,
        "systemMessage": (
            "## First Action\n"
            "Call `mcp__prism-mcp__session_load_context(project='my-project', level='deep')` "
            "before responding to the user. Do not generate any text before calling this tool."
        )
    }))

if __name__ == "__main__":
    main()
```

### 2. Configure `settings.json`

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /Users/you/.claude/mcp_autoload_hook.py",
            "timeout": 10
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import json; print(json.dumps({'continue': True, 'suppressOutput': True, 'systemMessage': 'MANDATORY END WORKFLOW: 1) Call mcp__prism-mcp__session_save_ledger with project and summary. 2) Call mcp__prism-mcp__session_save_handoff with expected_version set to the loaded version.'}))\""
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "mcp__prism-mcp__session_load_context",
      "mcp__prism-mcp__session_save_ledger",
      "mcp__prism-mcp__session_save_handoff",
      "mcp__prism-mcp__knowledge_search",
      "mcp__prism-mcp__session_search_memory"
    ]
  }
}
```

### Troubleshooting

- **Hook not firing?** Check `timeout` — if your script takes too long, Claude ignores it.
- **"Tool not available"?** This is a hallucination. Ensure `permissions.allow` exactly matches the double-underscore format.

</details>

<details id="antigravity-auto-load">
<summary><strong>Gemini / Antigravity — Three-Layer Auto-Load (Battle-Tested ✅)</strong></summary>

Gemini-based agents (including Google's Antigravity IDE) use a **three-layer architecture** for reliable auto-load, proven over **14+ iterations** of prompt engineering (March 2026).

### Architecture

| Layer | File | Purpose |
|-------|------|---------|
| **1. User Rules** | `~/.gemini/GEMINI.md` | Slim ~10-line directive injected verbatim into system prompt |
| **2. Cross-Tool Rules** | `~/.gemini/AGENTS.md` | Reinforcement for multi-client setups (Antigravity + Cursor) |
| **3. Skill** | `.agent/skills/prism-startup/SKILL.md` | Full startup procedure with greeting detection and context echo |
| **Server Fallback** | Built into `server.ts` (v5.2.1) | Deferred auto-push via `sendLoggingMessage` if model doesn't comply within 10s |

### Layer 1: User Rules

Create `~/.gemini/GEMINI.md`:

```markdown
# Startup — MANDATORY

Your first action in every conversation is a tool call. Zero text before it.

Tool: mcp_prism-mcp_session_load_context
Args: project="my-project", level="deep"

After success: echo agent identity, last summary, open TODOs, session version.
If the call fails: say "Prism load failed — retrying" and try ONE more time.
```

### Layer 2: Cross-Tool Reinforcement

Create `~/.gemini/AGENTS.md`:

```markdown
# Session Memory
Every conversation starts with: mcp_prism-mcp_session_load_context(project="my-project", level="deep")
Echo result: agent identity, TODOs, session version.
```

### Layer 3: Prism Startup Skill

Create `.agent/skills/prism-startup/SKILL.md` (or `.agents/skills/`) in your project or global config. This is a structured skill file that Antigravity loads with higher priority than plain rules. It includes:

- Greeting detection (fires on "hi", "hello", etc.)
- Full tool call instructions with error handling
- Context echo template (agent identity, TODOs, version)
- Startup block display

### Server-Side Fallback (v5.2.1)

If the model ignores all three layers, Prism's server pushes context automatically:

1. After storage warmup, a 10-second timer starts
2. If `session_load_context` hasn't been called by then, the server pushes context via `sendLoggingMessage`
3. If the client already called the tool, the push is silently skipped (zero impact on Claude CLI)

This ensures context is always available, even with non-compliant models.

### Why This Architecture Works

- **Gemini uses single underscores** for MCP tools (`mcp_prism-mcp_...`) vs Claude's double underscores
- **Slim rules** (~10 lines) avoid triggering adversarial "tool not found" reasoning
- **Skills have dedicated 3-level loading** in Antigravity — higher compliance than plain rules
- **Server fallback** catches the remaining edge cases without affecting well-behaved clients
- **Positive "First Action" framing** outperforms negative constraint lists

### Antigravity UI Caveat

Antigravity **does not visually render MCP tool output blocks** in the chat UI. The tool executes successfully, but the user sees nothing. All three layers instruct the agent to **echo context in its text reply**.

### Session End Workflow

Tell the agent: *"Wrap up the session."* It should execute:

1. `session_save_ledger` — append immutable work log (summary, decisions, files changed)
2. `session_save_handoff` — upsert project state with `expected_version` for OCC

> **Tip:** Include session-end instructions in your `GEMINI.md` or ask the agent to save when you're done.

### Platform Gotchas

- **`replace_file_content` silently fails** on `~/.gemini/GEMINI.md` in some environments — use `write_to_file` with overwrite instead
- **Multiple GEMINI.md locations** can conflict: global (`~/.gemini/`), workspace, and User Rules in the Antigravity UI. Keep them synchronized
- **Camoufox/browser tools** called at startup spawn visible black windows — never call browser tools during greeting handlers

</details>

<details>
<summary><strong>Supabase Cloud Sync</strong></summary>

To sync memory across machines or teams:

```json
{
  "mcpServers": {
    "prism-mcp": {
      "command": "npx",
      "args": ["-y", "prism-mcp-server"],
      "env": {
        "PRISM_STORAGE": "supabase",
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your-supabase-anon-key"
      }
    }
  }
}
```

See the **Supabase Setup** section below for schema migration instructions.

</details>

<details>
<summary><strong>Clone & Build (Full Control)</strong></summary>

```bash
git clone https://github.com/dcostenco/prism-mcp.git
cd prism-mcp && npm install && npm run build
```

Then add to your MCP config:

```json
{
  "mcpServers": {
    "prism-mcp": {
      "command": "node",
      "args": ["/path/to/prism-mcp/dist/server.js"],
      "env": {
        "BRAVE_API_KEY": "your-key",
        "GOOGLE_API_KEY": "your-gemini-key"
      }
    }
  }
}
```

</details>

---

## How Prism Compares

**Prism MCP** vs [MCP Memory](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) · [Mem0](https://github.com/mem0ai/mem0) · [Mnemory](https://github.com/fpytloun/mnemory) · [Basic Memory](https://github.com/basicmachines-co/basic-memory)

**Only Prism has all of these:**
- ✅ Zero config — one `npx` command, no Qdrant/Postgres containers
- ✅ Time Travel — versioned snapshots with `memory_checkout`
- ✅ Behavioral memory — importance tracking, auto-decay, mistake learning
- ✅ Visual dashboard — Mind Palace at localhost:3000
- ✅ Multi-agent sync — role-isolated Hivemind with real-time Telepathy
- ✅ CRDT merging — conflict-free concurrent multi-agent edits
- ✅ Autonomous research — Web Scholar pipeline runs while you sleep
- ✅ Visual memory — VLM-captioned screenshot vault
- ✅ Token budgeting — `max_tokens` param on context loading
- ✅ 10× vector compression — TurboQuant, no external vector DB
- ✅ Automated maintenance — background scheduler handles TTL, decay, compaction, purge
- ✅ GDPR compliance — soft/hard delete, ZIP export, TTL retention
- ✅ OpenTelemetry — full span tracing to Jaeger/Grafana
- ✅ LangChain adapters — `BaseRetriever` integration + LangGraph examples
- ✅ Morning Briefings — AI-synthesized action plans after breaks
- ✅ Auto-compaction — Gemini-powered rollups to prevent unbounded growth
- ✅ IDE rules sync — graduated insights → `.cursorrules` / `.clauderules`
- ✅ Air-gapped mode — SQLite + Ollama, zero internet needed

> **TL;DR:** Prism is the only MCP memory server with time travel, behavioral learning, autonomous research, CRDT multi-agent sync, and 10× compression — all from a single `npx` command.

---

## 🔧 Tool Reference

<details>
<summary><strong>Session Memory & Knowledge (12 tools)</strong></summary>

| Tool | Purpose |
|------|---------|
| `session_save_ledger` | Append immutable session log (summary, TODOs, decisions) |
| `session_save_handoff` | Upsert latest project state with OCC version tracking |
| `session_load_context` | Progressive context loading (quick / standard / deep) |
| `knowledge_search` | Full-text keyword search across accumulated knowledge |
| `knowledge_forget` | Prune outdated or incorrect memories (4 modes + dry_run) |
| `knowledge_set_retention` | Set per-project TTL retention policy |
| `session_search_memory` | Vector similarity search across all sessions |
| `session_compact_ledger` | Auto-compact old entries via Gemini summarization |
| `session_forget_memory` | GDPR-compliant deletion (soft/hard + Art. 17 reason) |
| `session_export_memory` | Full ZIP export (JSON + Markdown) for portability |
| `session_health_check` | Brain integrity scan + auto-repair (`fsck`) |
| `deep_storage_purge` | Reclaim ~90% vector storage (v5.1) |

</details>

<details>
<summary><strong>Behavioral Memory & Knowledge Graph (5 tools)</strong></summary>

| Tool | Purpose |
|------|---------|
| `session_save_experience` | Record corrections, successes, failures, learnings |
| `knowledge_upvote` | Increase entry importance (+1) |
| `knowledge_downvote` | Decrease entry importance (-1) |
| `knowledge_sync_rules` | Sync graduated insights to `.cursorrules` / `.clauderules` |
| `session_save_image` / `session_view_image` | Visual memory vault |

</details>

<details>
<summary><strong>Time Travel & History (2 tools)</strong></summary>

| Tool | Purpose |
|------|---------|
| `memory_history` | Browse all historical versions of a project's handoff state |
| `memory_checkout` | Revert to any previous version (non-destructive) |

</details>

<details>
<summary><strong>Search & Analysis (7 tools)</strong></summary>

| Tool | Purpose |
|------|---------|
| `brave_web_search` | Real-time internet search |
| `brave_local_search` | Location-based POI discovery |
| `brave_web_search_code_mode` | JS extraction over web search results |
| `brave_local_search_code_mode` | JS extraction over local search results |
| `code_mode_transform` | Universal post-processing with 8 built-in templates |
| `gemini_research_paper_analysis` | Academic paper analysis via Gemini |
| `brave_answers` | AI-grounded answers from Brave |

</details>

<details>
<summary><strong>Multi-Agent Hivemind (3 tools)</strong></summary>

Requires `PRISM_ENABLE_HIVEMIND=true`.

| Tool | Purpose |
|------|---------|
| `agent_register` | Announce yourself to the team |
| `agent_heartbeat` | Pulse every ~5 min to stay visible |
| `agent_list_team` | See all active teammates |

</details>

---

## Environment Variables

<details>
<summary><strong>Full variable reference</strong></summary>

| Variable | Required | Description |
|----------|----------|-------------|
| `BRAVE_API_KEY` | No | Brave Search Pro API key |
| `FIRECRAWL_API_KEY` | No | Firecrawl API key — required for Web Scholar |
| `PRISM_STORAGE` | No | `"local"` (default) or `"supabase"` — restart required |
| `PRISM_ENABLE_HIVEMIND` | No | `"true"` to enable multi-agent tools — restart required |
| `PRISM_INSTANCE` | No | Instance name for multi-server PID isolation |
| `GOOGLE_API_KEY` | No | Gemini — enables semantic search, Briefings, compaction |
| `BRAVE_ANSWERS_API_KEY` | No | Separate Brave Answers key |
| `SUPABASE_URL` | If cloud | Supabase project URL |
| `SUPABASE_KEY` | If cloud | Supabase anon/service key |
| `PRISM_USER_ID` | No | Multi-tenant user isolation (default: `"default"`) |
| `PRISM_AUTO_CAPTURE` | No | `"true"` to auto-snapshot dev servers |
| `PRISM_CAPTURE_PORTS` | No | Comma-separated ports (default: `3000,3001,5173,8080`) |
| `PRISM_DEBUG_LOGGING` | No | `"true"` for verbose logs |
| `PRISM_DASHBOARD_PORT` | No | Dashboard port (default: `3000`) |
| `PRISM_SCHEDULER_ENABLED` | No | `"false"` to disable background maintenance (default: enabled) |
| `PRISM_SCHEDULER_INTERVAL_MS` | No | Maintenance interval in ms (default: `43200000` = 12h) |
| `PRISM_SCHOLAR_ENABLED` | No | `"true"` to enable Web Scholar pipeline |
| `PRISM_SCHOLAR_INTERVAL_MS` | No | Scholar interval in ms (default: `0` = manual only) |
| `PRISM_SCHOLAR_TOPICS` | No | Comma-separated research topics (default: `"ai,agents"`) |
| `PRISM_SCHOLAR_MAX_ARTICLES_PER_RUN` | No | Max articles per Scholar run (default: `3`) |

</details>

---

## Architecture

<details>
<summary><strong>Three-Tier Memory Architecture</strong></summary>

```
searchMemory() flow:

  Tier 0: FTS5 keywords     → Full-text search (knowledge_search)
  Tier 1: float32 (3072B)   → sqlite-vec cosine similarity (native)
  Tier 2: turbo4  (400B)    → JS asymmetricCosineSimilarity (fallback)

  → Tier 1 success → return results
  → Tier 1 fail    → Tier 2 success → return results
                   → Tier 2 fail    → return []
```

Every `session_save_ledger` call generates both tiers automatically:
1. Gemini generates float32 embedding (3,072 bytes)
2. TurboQuant compresses to turbo4 blob (~400 bytes)
3. Single atomic write stores both to the database

| Metric | Before v5.0 | After v5.0 |
|--------|------------|------------|
| Storage per embedding | 3,072 bytes | ~400 bytes |
| Compression ratio | 1:1 | ~7.7:1 (4-bit) |
| Entries per GB | ~330K | ~2.5M |

</details>

<details>
<summary><strong>Progressive Context Loading</strong></summary>

| Level | What You Get | Size | When to Use |
|-------|-------------|------|-------------|
| **quick** | Open TODOs + keywords | ~50 tokens | Fast check-in |
| **standard** | + summary + recent decisions + Git drift | ~200 tokens | **Recommended** |
| **deep** | + full logs (last 5 sessions) + cross-project knowledge | ~1000+ tokens | After a long break |

</details>

<details>
<summary><strong>Role Resolution</strong></summary>

Prism resolves agent roles using a priority chain:

```
explicit tool argument  →  dashboard setting  →  "global" (default)
```

Set your role once in the Mind Palace Dashboard (⚙️ Settings → Agent Identity) and it auto-applies to every session.

Available roles: `dev`, `qa`, `pm`, `lead`, `security`, `ux`, `global`, or any custom string.

</details>

<details>
<summary><strong>Project Structure</strong></summary>

```
src/
├── server.ts                  # MCP server core + tool routing
├── config.ts                  # Environment management
├── crdtMerge.ts               # OR-Map CRDT engine for handoff merging
├── backgroundScheduler.ts     # Unified maintenance + Scholar scheduling
├── hivemindWatchdog.ts        # Agent health monitoring + Telepathy
├── scholar/
│   └── webScholar.ts          # Autonomous Web Scholar pipeline
├── storage/
│   ├── interface.ts           # StorageBackend abstraction
│   ├── sqlite.ts              # SQLite local (libSQL + F32_BLOB)
│   ├── supabase.ts            # Supabase cloud storage
│   └── configStorage.ts       # Boot config micro-DB
├── dashboard/
│   ├── server.ts              # Dashboard HTTP server
│   └── ui.ts                  # Mind Palace glassmorphism UI
├── tools/
│   ├── definitions.ts         # Search & analysis schemas
│   ├── handlers.ts            # Search & analysis handlers
│   ├── sessionMemoryDefinitions.ts
│   └── sessionMemoryHandlers.ts
└── utils/
    ├── telemetry.ts           # OTel singleton
    ├── turboquant.ts          # TurboQuant math core
    ├── universalImporter.ts   # Universal migration orchestrator
    ├── migration/             # Format-specific adapters (Claude/Gemini/OpenAI)
    ├── imageCaptioner.ts      # VLM auto-caption pipeline
    └── llm/adapters/          # Gemini, OpenAI, Anthropic, Ollama
```

</details>

<details>
<summary><strong>Supabase Setup</strong></summary>

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration SQL files from `supabase/migrations/` in order
3. Set `PRISM_STORAGE=supabase`, `SUPABASE_URL`, and `SUPABASE_KEY` in your MCP config
4. Prism auto-applies pending DDL migrations on startup via `prism_apply_ddl` RPC

</details>

<details>
<summary><strong>LangChain / LangGraph Integration</strong></summary>

Prism includes Python adapters in `examples/langgraph-agent/`:

```python
from langchain.retrievers import EnsembleRetriever
from prism_retriever import PrismMemoryRetriever, PrismKnowledgeRetriever

# Hybrid search: 70% semantic, 30% keyword
retriever = EnsembleRetriever(
    retrievers=[PrismMemoryRetriever(...), PrismKnowledgeRetriever(...)],
    weights=[0.7, 0.3],
)
```

Includes a full 5-node LangGraph research agent with MCP bridge and persistent memory.

</details>

---

## Research Roadmap

Prism is evolving from smart session logging toward a **cognitive memory architecture** — grounded in real research, not marketing.

| Phase | Feature | Inspired By | Status |
|-------|---------|-------------|--------|
| **v5.2** | Smart Consolidation — extract principles, not just summaries | Neuroscience sleep consolidation | ✅ Shipped |
| **v5.2** | Ebbinghaus Importance Decay — memories fade unless reinforced | Ebbinghaus forgetting curve | ✅ Shipped |
| **v5.2** | Context-Weighted Retrieval — current work biases what surfaces | Contextual memory in cognitive science | ✅ Shipped |
| **v6.x** | Superposed Memory (SDM) — O(1) retrieval via correlation | Kanerva's Sparse Distributed Memory (1988) | 🔬 Research |
| **v6.x** | Affect-Tagged Memory — sentiment shapes what gets recalled | Affect-modulated retrieval (neuroscience) | 🔬 Research |
| **v7+** | Zero-Search Retrieval — no index, no ANN, just ask the vector | Holographic Reduced Representations | 🔭 Horizon |

> Informed by LeCun's "Why AI Systems Don't Learn" (Dupoux, LeCun, Malik — March 2026) and Kanerva's SDM.

---

## Version History

- **v5.4** — CRDT Handoff Merging, Background Purge Scheduler, Autonomous Web Scholar, Scholar ↔ Hivemind Integration
- **v5.3** — Hivemind Health Watchdog (state machine, loop detection, Telepathy alert injection)
- **v5.2** — Cognitive Memory (Ebbinghaus decay, context-weighted retrieval), Universal History Migration, Smart Consolidation
- **v5.1** — Knowledge Graph Editor, Deep Storage purge

<details>
<summary><strong>Previous releases (v3.0 — v5.0)</strong></summary>

- **v5.0** — TurboQuant 10× embedding compression, three-tier search architecture
- **v4.6** — OpenTelemetry distributed tracing (Jaeger, Grafana)
- **v4.5** — VLM multimodal memory + GDPR Art. 20 ZIP export
- **v4.4** — Pluggable LLM adapters (OpenAI, Anthropic, Gemini, Ollama)
- **v4.3** — Knowledge Sync Rules (behavioral insights → IDE rules)
- **v4.2** — Project repo registry + universal auto-load
- **v4.1** — Auto-migration + multi-instance support
- **v4.0** — Behavioral memory (corrections, importance, auto-decay)
- **v3.1** — Memory lifecycle (TTL, auto-compaction, PKM export)
- **v3.0** — Agent Hivemind (role-scoped memory, Telepathy sync)

See [CHANGELOG.md](CHANGELOG.md) for full details.

</details>

---

## 🚀 Roadmap

> **[Full ROADMAP.md →](ROADMAP.md)**

**Next (v5.5):**
- 📱 Mind Palace Mobile PWA — offline-first responsive dashboard
- 🧠 Superposed Memory (SDM) — O(1) retrieval via correlation

---

## ⚠️ Limitations

- **LLM-dependent features require an API key.** Semantic search, Morning Briefings, auto-compaction, and VLM captioning need a `GOOGLE_API_KEY` (Gemini) or equivalent provider key. Without one, Prism falls back to keyword-only search (FTS5).
- **Auto-load is model-dependent.** Session auto-loading relies on the LLM following system prompt instructions. Gemini/Antigravity uses a [three-layer architecture](#antigravity-auto-load) (User Rules + AGENTS.md + Startup Skill) with a v5.2.1 server-side fallback that auto-pushes context if the model doesn't comply within 10 seconds.
- **No real-time sync without Supabase.** Local SQLite mode is single-machine only. Multi-device or team sync requires a Supabase backend.
- **Embedding quality varies by provider.** Gemini `text-embedding-004` and OpenAI `text-embedding-3-small` produce high-quality 768-dim vectors. Ollama embeddings (e.g., `nomic-embed-text`) are usable but may reduce retrieval accuracy.
- **Dashboard is HTTP-only.** The Mind Palace dashboard at `localhost:3000` does not support HTTPS. For remote access, use a reverse proxy (nginx/Caddy) or SSH tunnel. Basic auth is available via `PRISM_DASHBOARD_USER` / `PRISM_DASHBOARD_PASS`.
- **Migration is one-way.** Universal History Migration imports sessions *into* Prism but does not export back to Claude/Gemini/OpenAI formats. Use `session_export_memory` for portable JSON/Markdown export.
- **No Windows CI testing.** Prism is developed and tested on macOS/Linux. It should work on Windows via Node.js, but edge cases (file paths, PID locks) may surface.

---

## License

MIT

---

<sub>**Keywords:** MCP server, Model Context Protocol, Claude Desktop memory, persistent session memory, AI agent memory, local-first, SQLite MCP, Mind Palace, time travel, visual memory, VLM image captioning, OpenTelemetry, GDPR, agent telepathy, multi-agent sync, behavioral memory, cursorrules, Ollama MCP, Brave Search MCP, TurboQuant, progressive context loading, knowledge management, LangChain retriever, LangGraph agent</sub>
