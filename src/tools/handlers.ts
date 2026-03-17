import { performWebSearch, performWebSearchRaw, performLocalSearch, performLocalSearchRaw, performBraveAnswers } from "../utils/braveApi.js";
import { analyzePaperWithGemini } from "../utils/googleAi.js";
import { isBraveWebSearchArgs, isBraveLocalSearchArgs, isBraveAnswersArgs, isGeminiResearchPaperAnalysisArgs, isBraveWebSearchCodeModeArgs, isBraveLocalSearchCodeModeArgs, isCodeModeTransformArgs } from "./definitions.js";
import { runInSandbox } from "../utils/executor.js";

// Web search handler
export async function webSearchHandler(args: unknown) {
  if (!isBraveWebSearchArgs(args)) {
    throw new Error("Invalid arguments for brave_web_search");
  }

  const { query, count = 10, offset = 0 } = args;
  const results = await performWebSearch(query, count, offset);

  return {
    content: [{ type: "text", text: results }],
    isError: false,
  };
}

// Web search code mode handler
export async function braveWebSearchCodeModeHandler(args: unknown) {
  if (!isBraveWebSearchCodeModeArgs(args)) {
    throw new Error("Invalid arguments for brave_web_search_code_mode");
  }

  const { query, count = 10, offset = 0, code, language = "javascript" } = args;

  if (language.toLowerCase() !== "javascript") {
    return {
      content: [{ type: "text", text: "Unsupported language. Only 'javascript' is supported." }],
      isError: true,
    };
  }

  // 1. Fetch raw data
  console.error(`Fetching web search for code mode: "${query}"`);
  const rawDataStr = await performWebSearchRaw(query, count, offset);
  const beforeSizeKB = (Buffer.byteLength(rawDataStr, 'utf8') / 1024).toFixed(1);

  // 2. Run code mode sandbox
  console.error(`Executing code mode sandbox...`);
  const { stdout, error, executionTimeMs } = await runInSandbox(rawDataStr, code);

  if (error) {
    return {
      content: [{ type: "text", text: `Sandboxed Execution Failed:\n${error}` }],
      isError: true,
    };
  }

  // 3. Compute reduction
  const finalOutput = stdout.trim() || "[No output from script]";
  const afterSizeKB = (Buffer.byteLength(finalOutput, 'utf8') / 1024).toFixed(1);
  const reductionPct = (100 - (Number(afterSizeKB) / Number(beforeSizeKB)) * 100).toFixed(1);

  const header = `[code-mode: ${beforeSizeKB}KB -> ${afterSizeKB}KB (${reductionPct}% reduction) in ${executionTimeMs}ms]\n\n`;

  return {
    content: [{ type: "text", text: header + finalOutput }],
    isError: false,
  };
}

// Local search code mode handler
export async function braveLocalSearchCodeModeHandler(args: unknown) {
  if (!isBraveLocalSearchCodeModeArgs(args)) {
    throw new Error("Invalid arguments for brave_local_search_code_mode");
  }

  const { query, count = 5, code, language = "javascript" } = args;

  if (language.toLowerCase() !== "javascript") {
    return {
      content: [{ type: "text", text: "Unsupported language. Only 'javascript' is supported." }],
      isError: true,
    };
  }

  console.error(`Fetching local search for code mode: "${query}"`);
  const rawDataStr = await performLocalSearchRaw(query, count);
  const beforeSizeKB = (Buffer.byteLength(rawDataStr, "utf8") / 1024).toFixed(1);

  console.error("Executing local search code mode sandbox...");
  const { stdout, error, executionTimeMs } = await runInSandbox(rawDataStr, code);

  if (error) {
    return {
      content: [{ type: "text", text: `Sandboxed Execution Failed:\n${error}` }],
      isError: true,
    };
  }

  const finalOutput = stdout.trim() || "[No output from script]";
  const afterSizeKB = (Buffer.byteLength(finalOutput, "utf8") / 1024).toFixed(1);
  const reductionPct = (100 - (Number(afterSizeKB) / Number(beforeSizeKB)) * 100).toFixed(1);

  const header = `[code-mode: ${beforeSizeKB}KB -> ${afterSizeKB}KB (${reductionPct}% reduction) in ${executionTimeMs}ms]\n\n`;

  return {
    content: [{ type: "text", text: header + finalOutput }],
    isError: false,
  };
}

// Generic code mode transform handler (works with any MCP tool output)
export async function codeModeTransformHandler(args: unknown) {
  if (!isCodeModeTransformArgs(args)) {
    throw new Error("Invalid arguments for code_mode_transform");
  }

  const { data, code, language = "javascript", source_tool = "unknown" } = args;

  if (language.toLowerCase() !== "javascript") {
    return {
      content: [{ type: "text", text: "Unsupported language. Only 'javascript' is supported." }],
      isError: true,
    };
  }

  const beforeSizeKB = (Buffer.byteLength(data, "utf8") / 1024).toFixed(1);
  console.error(`[code_mode_transform] source=${source_tool}, input=${beforeSizeKB}KB`);

  const { stdout, error, executionTimeMs } = await runInSandbox(data, code);

  if (error) {
    return {
      content: [{ type: "text", text: `Sandboxed Execution Failed:\n${error}` }],
      isError: true,
    };
  }

  const finalOutput = stdout.trim() || "[No output from script]";
  const afterSizeKB = (Buffer.byteLength(finalOutput, "utf8") / 1024).toFixed(1);
  const reductionPct = (100 - (Number(afterSizeKB) / Number(beforeSizeKB)) * 100).toFixed(1);

  const header = `[code-mode-transform (${source_tool}): ${beforeSizeKB}KB -> ${afterSizeKB}KB (${reductionPct}% reduction) in ${executionTimeMs}ms]\n\n`;

  return {
    content: [{ type: "text", text: header + finalOutput }],
    isError: false,
  };
}

// Local search handler
export async function localSearchHandler(args: unknown) {
  if (!isBraveLocalSearchArgs(args)) {
    throw new Error("Invalid arguments for brave_local_search");
  }

  const { query, count = 5 } = args;
  const results = await performLocalSearch(query, count);

  return {
    content: [{ type: "text", text: results }],
    isError: false,
  };
}

// Brave answers handler
export async function braveAnswersHandler(args: unknown) {
  if (!isBraveAnswersArgs(args)) {
    throw new Error("Invalid arguments for brave_answers");
  }

  const { query, model = "brave" } = args;
  const answer = await performBraveAnswers(query, model);

  return {
    content: [{ type: "text", text: answer }],
    isError: false,
  };
}

// Research paper analysis handler
export async function researchPaperAnalysisHandler(args: unknown) {
  if (!isGeminiResearchPaperAnalysisArgs(args)) {
    throw new Error("Invalid arguments for gemini_research_paper_analysis");
  }

  const { paperContent, analysisType = "comprehensive", additionalContext } = args;

  // Check if paper content is too short
  if (paperContent.length < 100) {
    return {
      content: [{
        type: "text",
        text: "The provided paper content is too short for meaningful analysis. Please provide more comprehensive text."
      }],
      isError: true,
    };
  }

  try {
    console.error(`Analyzing research paper with Gemini (${analysisType} analysis)...`);
    const analysis = await analyzePaperWithGemini(paperContent, analysisType, additionalContext);

    return {
      content: [{ type: "text", text: analysis }],
      isError: false,
    };
  } catch (error) {
    console.error("Research paper analysis error:", error);
    return {
      content: [{
        type: "text",
        text: `Error analyzing research paper: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true,
    };
  }
}
