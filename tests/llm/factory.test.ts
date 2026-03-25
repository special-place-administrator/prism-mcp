/**
 * LLM Provider Factory — Switching Tests (v4.4 Phase 2)
 *
 * Validates the factory's provider-selection logic without making real API calls.
 * Uses _resetLLMProvider() between tests to flush the singleton.
 *
 * NOTE: We don't test actual Gemini/OpenAI responses here — that's an integration
 * test concern. We only verify that the factory correctly reads `llm_provider` from
 * configStorage and instantiates the right class.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { _resetLLMProvider, getLLMProvider } from "../../src/utils/llm/factory.js";
import { GeminiAdapter } from "../../src/utils/llm/adapters/gemini.js";
import { OpenAIAdapter } from "../../src/utils/llm/adapters/openai.js";

// ─── Mock: configStorage ──────────────────────────────────────────
// We mock getSettingSync so tests don't need a real SQLite DB.
vi.mock("../../src/storage/configStorage.js", () => ({
  getSettingSync: vi.fn((key: string, defaultValue: string) => defaultValue),
}));

// ─── Mock: GeminiAdapter ──────────────────────────────────────────
// Vitest requires class/function mocks (not arrow fns) for `new ClassName()` to work.
vi.mock("../../src/utils/llm/adapters/gemini.js", () => ({
  GeminiAdapter: vi.fn(function (this: any) {
    this.generateText = vi.fn();
    this.generateEmbedding = vi.fn();
  }),
}));

// ─── Mock: OpenAIAdapter ──────────────────────────────────────────
vi.mock("../../src/utils/llm/adapters/openai.js", () => ({
  OpenAIAdapter: vi.fn(function (this: any) {
    this.generateText = vi.fn();
    this.generateEmbedding = vi.fn();
  }),
}));

import { getSettingSync } from "../../src/storage/configStorage.js";
const mockGetSettingSync = vi.mocked(getSettingSync);

// ─── Test Suite ───────────────────────────────────────────────────

describe("LLM Provider Factory", () => {
  beforeEach(() => {
    _resetLLMProvider();
    vi.clearAllMocks();
  });

  it("defaults to GeminiAdapter when llm_provider is not set", () => {
    mockGetSettingSync.mockReturnValue("gemini");
    const provider = getLLMProvider();
    expect(GeminiAdapter).toHaveBeenCalledOnce();
    expect(OpenAIAdapter).not.toHaveBeenCalled();
    expect(provider).toBeDefined();
  });

  it("uses GeminiAdapter when llm_provider = 'gemini'", () => {
    mockGetSettingSync.mockImplementation((key) =>
      key === "llm_provider" ? "gemini" : ""
    );
    getLLMProvider();
    expect(GeminiAdapter).toHaveBeenCalledOnce();
    expect(OpenAIAdapter).not.toHaveBeenCalled();
  });

  it("uses OpenAIAdapter when llm_provider = 'openai'", () => {
    mockGetSettingSync.mockImplementation((key) => {
      if (key === "llm_provider") return "openai";
      if (key === "openai_api_key") return "sk-test-key";
      if (key === "openai_base_url") return "https://api.openai.com/v1";
      return "";
    });
    getLLMProvider();
    expect(OpenAIAdapter).toHaveBeenCalledOnce();
    expect(GeminiAdapter).not.toHaveBeenCalled();
  });

  it("returns the same singleton on repeated calls", () => {
    mockGetSettingSync.mockReturnValue("gemini");
    const a = getLLMProvider();
    const b = getLLMProvider();
    expect(a).toBe(b);
    expect(GeminiAdapter).toHaveBeenCalledOnce(); // only one init
  });

  it("falls back to Gemini when the chosen provider throws on init", () => {
    // OpenAI selected but adapter throws (bad config)
    mockGetSettingSync.mockImplementation((key) =>
      key === "llm_provider" ? "openai" : ""
    );
    vi.mocked(OpenAIAdapter).mockImplementationOnce(() => {
      throw new Error("Missing API key");
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const provider = getLLMProvider();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Falling back to GeminiAdapter"));
    expect(GeminiAdapter).toHaveBeenCalledOnce(); // fallback
    expect(provider).toBeDefined();
    consoleSpy.mockRestore();
  });

  it("_resetLLMProvider() clears singleton so next call re-initialises", () => {
    mockGetSettingSync.mockReturnValue("gemini");
    getLLMProvider();
    _resetLLMProvider();
    getLLMProvider();
    expect(GeminiAdapter).toHaveBeenCalledTimes(2); // two inits
  });
});
