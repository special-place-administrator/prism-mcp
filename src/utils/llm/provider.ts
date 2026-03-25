/**
 * LLM Provider Interface (v4.4)
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE:
 *   Defines the contract that ALL LLM adapters must satisfy.
 *   This is the single seam in Prism's AI layer — the only thing consumers
 *   (compaction, summarization, embedding, security scan, briefing) need to
 *   know about. They never reference a specific model or SDK.
 *
 * DESIGN PHILOSOPHY:
 *   Keep the interface intentionally minimal. Prism only needs two LLM
 *   capabilities for its own internal operations. Adding more methods here
 *   would force every future adapter to implement things it doesn't need.
 *
 * ADAPTER IMPLEMENTATIONS (src/utils/llm/adapters/):
 *   - gemini.ts   → Google Gemini (default)
 *   - openai.ts   → OpenAI Cloud + Ollama + LM Studio + vLLM
 *
 * FACTORY RESOLUTION:
 *   Never instantiate adapters directly. Always call:
 *     import { getLLMProvider } from "../llm/factory.js";
 *     const llm = getLLMProvider();
 */

export interface LLMProvider {
  /**
   * Generate text using the active LLM.
   *
   * USED BY:
   *   - session_compact_ledger   → summarizes old session entries
   *   - gemini_research_paper_analysis → analysis prompt
   *   - consolidateFacts()       → memory merge/deduplicate
   *   - generateMorningBriefing()→ daily briefing generation
   *   - scanForPromptInjection() → security scan of session context
   *
   * @param prompt            The main user prompt / instructions
   * @param systemInstruction Optional system-level preamble.
   *                          Gemini maps this to systemInstruction.
   *                          OpenAI maps this to a { role: "system" } message.
   *                          Adapters that don't support system prompts
   *                          should prepend it to the user prompt instead.
   */
  generateText(prompt: string, systemInstruction?: string): Promise<string>;

  /**
   * Generate an embedding vector for semantic memory search.
   *
   * DIMENSION CONTRACT:
   *   Prism standardizes on 768 dimensions. This matches:
   *     - gemini-embedding-001 native output
   *     - text-embedding-3-small with dimensions: 768 (Matryoshka)
   *     - sqlite-vec and pgvector column sizes in both storage backends
   *   Adapters MUST return exactly 768 values or throw.
   *
   * USED BY:
   *   - session_search_memory   → query vector for cosine similarity
   *   - session_save_ledger     → embedding backfill (fire-and-forget)
   *   - session_save_handoff    → embedding backfill (fire-and-forget)
   *   - backfillEmbeddingsAsync → retroactive embedding of old entries
   *
   * @param text Raw text to embed. Adapters are responsible for truncation.
   */
  generateEmbedding(text: string): Promise<number[]>;
}
