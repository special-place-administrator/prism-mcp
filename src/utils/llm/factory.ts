/**
 * LLM Provider Factory (v4.4)
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE:
 *   Single point of resolution for the active LLMProvider adapter.
 *   All internal Prism tooling calls `getLLMProvider()` rather than
 *   importing or constructing SDK clients directly. This is the only
 *   file that needs to change when a new provider is added.
 *
 * SINGLETON PATTERN:
 *   The provider instance is cached for the lifetime of the MCP server process.
 *   This avoids repeated constructor overhead (SDK client init, config reads)
 *   on every tool call. If the user switches providers in the dashboard, they
 *   must restart the MCP server to pick up the change.
 *
 * PROVIDER SELECTION:
 *   Reads `llm_provider` from configStorage (Prism Mind Palace dashboard).
 *   Dashboard setting → "gemini" (default) or "openai"
 *
 *   llm_provider = "gemini"  → GeminiAdapter  (requires GOOGLE_API_KEY)
 *   llm_provider = "openai"  → OpenAIAdapter  (cloud: requires OPENAI_API_KEY,
 *                                               local: Ollama / LM Studio / vLLM)
 *
 * GRACEFUL DEGRADATION:
 *   If the chosen provider fails to initialize (e.g. missing API key),
 *   the factory logs the error and falls back to GeminiAdapter rather than
 *   crashing the MCP server process. An MCP server that throws on startup
 *   would become invisible to the client with no diagnostic output.
 *
 * TESTING:
 *   `_resetLLMProvider()` clears the singleton so unit tests can inject
 *   mock providers via vi.mock() without cross-test contamination.
 *
 * PHASE 3 ROADMAP:
 *   To add a new provider (e.g. Anthropic, Azure):
 *     1. Implement LLMProvider in src/utils/llm/adapters/<provider>.ts
 *     2. Add a case to the switch statement below
 *     3. Add the provider name to the dashboard "AI Providers" dropdown
 */

import { getSettingSync } from "../../storage/configStorage.js";
import type { LLMProvider } from "./provider.js";
import { GeminiAdapter } from "./adapters/gemini.js";
import { OpenAIAdapter } from "./adapters/openai.js";

// Module-level singleton — one adapter per MCP server process lifetime.
let providerInstance: LLMProvider | null = null;

/**
 * Returns the singleton LLM provider, initializing it on first call.
 *
 * Selection order:
 *   1. Read `llm_provider` from configStorage (dashboard setting, default: "gemini")
 *   2. Instantiate the matching adapter (GeminiAdapter or OpenAIAdapter)
 *   3. On any init error (e.g. missing API key), fall back to GeminiAdapter
 */
export function getLLMProvider(): LLMProvider {
  // Fast path: return cached instance (hot path for every tool call)
  if (providerInstance) return providerInstance;

  // Read from dashboard settings — default "gemini" if never configured.
  // getSettingSync() is synchronous (reads from in-memory cache backed by SQLite).
  const providerType = getSettingSync("llm_provider", "gemini");

  try {
    switch (providerType) {
      case "openai":
        // Covers: OpenAI Cloud, Ollama, LM Studio, vLLM, any /v1-compatible server
        providerInstance = new OpenAIAdapter();
        break;
      case "gemini":
      default:
        // Default path: existing behavior, zero behavioral regression
        providerInstance = new GeminiAdapter();
        break;
    }
  } catch (err) {
    // Init failure (e.g. user set provider to "openai" but forgot the API key).
    // Falling back keeps the MCP server alive — a crash here would be silent.
    console.error(
      `[LLMFactory] Failed to initialise "${providerType}" provider: ${err}. ` +
      `Falling back to GeminiAdapter.`
    );
    providerInstance = new GeminiAdapter();
  }

  return providerInstance;
}

/**
 * Reset the cached singleton.
 *
 * NEVER call this in production code — it forces a re-init on the next
 * getLLMProvider() call, which is expensive and not thread-safe.
 *
 * USE ONLY IN:
 *   - Unit tests (between test cases via beforeEach)
 *   - Future dashboard "switch provider without restart" flow
 */
export function _resetLLMProvider(): void {
  providerInstance = null;
}
