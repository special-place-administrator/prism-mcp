# Changelog

All notable changes to Prism MCP will be documented in this file.

## 🚀 v5.0.0 — The TurboQuant Update (2026-03-26)

**Quantized Agentic Memory is here.**

### ✨ Features

- **10× Storage Reduction:** Integrated Google's TurboQuant algorithm (ICLR 2026) to compress 768-dim embeddings from 3,072 bytes to ~400 bytes. Zero external dependencies — pure TypeScript math core with Householder QR, Lloyd-Max scalar quantization, and QJL residual correction.
- **Two-Tier Search:** Introduced a JS-land asymmetric similarity search fallback (`asymmetricCosineSimilarity`), ensuring semantic search works even without native DB vector extensions (`sqlite-vec` / `pgvector`).
- **Atomic Backfill:** Optimized background workers to repair and compress embeddings in a single atomic database update (`patchLedger`), reducing lock contention for multi-agent Hivemind use cases.
- **Supabase Parity:** Full support for quantized blobs in the cloud backend (migration v29 + `saveLedger` insert).

### 🏗️ Architecture

- New file: `src/utils/turboquant.ts` — 665 lines, zero-dependency math core
- Storage schema: `embedding_compressed` (TEXT/base64), `embedding_format` (turbo3/turbo4/float32), `embedding_turbo_radius` (REAL)
- SQLite migration v5.0 (3 idempotent ALTER TABLE)
- Supabase migration v29 via `prism_apply_ddl` RPC

### 📊 Benchmarks

| Metric | Value |
|--------|-------|
| Compression ratio (d=768, 4-bit) | **~7.7:1** (400 bytes vs 3,072) |
| Compression ratio (d=768, 3-bit) | **~10.1:1** (304 bytes vs 3,072) |
| Similarity correlation (4-bit) | >0.85 |
| Top-1 retrieval accuracy (N=100) | >90% |
| Tests | 295/295 pass |

### 📚 Documentation

- Published RFC-001: Quantized Agentic Memory (`docs/rfcs/001-turboquant-integration.md`)

---

## v4.6.1 — Stability (2026-03-25)

- Fixed auto-load reliability for `session_load_context` tool
- Dashboard project dropdown freeze resolved

## v4.6.0 — Observable AI (2026-03-25)

- OpenTelemetry distributed tracing integration
- Visual Language Model (VLM) image captioning
- Mind Palace dashboard improvements

## v4.3.0 — IDE Rules Sync (2026-03-25)

- `knowledge_sync_rules` tool: graduated insights → `.cursorrules` / `.clauderules`
- Sentinel-based idempotent file writing

## v4.0.0 — Behavioral Memory (2026-03-24)

- Active Behavioral Memory with experience events
- Importance scoring and graduated insights
- Pluggable LLM providers (OpenAI, Anthropic, Gemini, Ollama)

## v3.0.0 — Hivemind (2026-03-23)

- Multi-agent role-based scoping
- Team roster injection on context load

## v2.0.0 — Time Travel (2026-03-22)

- Version-controlled handoff snapshots
- `memory_history` + `memory_checkout` tools
- Visual memory (image save/view)

## v1.0.0 — Foundation (2026-03-20)

- Session ledger with keyword extraction
- Handoff state persistence
- SQLite + Supabase dual backends
- Semantic search via pgvector / sqlite-vec
- GDPR export and surgical deletion
