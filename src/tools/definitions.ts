import { type Tool } from "@modelcontextprotocol/sdk/types.js";

// Web Search Code Mode Tool Definition
export const BRAVE_WEB_SEARCH_CODE_MODE_TOOL: Tool = {
  name: "brave_web_search_code_mode",
  description:
    "Performs a web search using the Brave Search API, and then runs a custom JavaScript code string against the RAW API RESPONSE in a secure QuickJS sandbox. " +
    "This drastically reduces context window usage by only returning the output of your script. " +
    "Use this for broad information gathering, recent events, or when you need diverse web sources and only need specific parts of the result. " +
    "Your script should read the 'DATA' global variable (a JSON string of the API response), process it, and use console.log() to print the desired output.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (max 400 chars, 50 words)",
      },
      count: {
        type: "number",
        description: "Number of results (1-20, default 10)",
        default: 10,
      },
      offset: {
        type: "number",
        description: "Pagination offset (max 9, default 0)",
        default: 0,
      },
      code: {
        type: "string",
        description: "JavaScript code to execute against the 'DATA' variable. E.g. `const r = JSON.parse(DATA); console.log(r.web.results.map(x => x.title).join(', '));`",
      },
      language: {
        type: "string",
        description: "Language of the code. Only 'javascript' is supported.",
        default: "javascript",
      }
    },
    required: ["query", "code"],
  },
};

// Web Search Tool Definition
export const WEB_SEARCH_TOOL: Tool = {
  name: "brave_web_search",
  description:
    "Performs a web search using the Brave Search API, ideal for general queries, news, articles, and online content. " +
    "Use this for broad information gathering, recent events, or when you need diverse web sources. " +
    "Supports pagination, content filtering, and freshness controls. " +
    "Maximum 20 results per request, with offset for pagination. ",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (max 400 chars, 50 words)",
      },
      count: {
        type: "number",
        description: "Number of results (1-20, default 10)",
        default: 10,
      },
      offset: {
        type: "number",
        description: "Pagination offset (max 9, default 0)",
        default: 0,
      },
    },
    required: ["query"],
  },
};

// Local Search Tool Definition
export const LOCAL_SEARCH_TOOL: Tool = {
  name: "brave_local_search",
  description:
    "Searches for local businesses and places using Brave's Local Search API. " +
    "Best for queries related to physical locations, businesses, restaurants, services, etc. " +
    "Returns detailed information including:\n" +
    "- Business names and addresses\n" +
    "- Ratings and review counts\n" +
    "- Phone numbers and opening hours\n" +
    "Use this when the query implies 'near me' or mentions specific locations. " +
    "Automatically falls back to web search if no local results are found.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Local search query (e.g. 'pizza near Central Park')",
      },
      count: {
        type: "number",
        description: "Number of results (1-20, default 5)",
        default: 5,
      },
    },
    required: ["query"],
  },
};

// Local Search Code Mode Tool Definition
export const BRAVE_LOCAL_SEARCH_CODE_MODE_TOOL: Tool = {
  name: "brave_local_search_code_mode",
  description:
    "Performs a local search using Brave APIs, and then runs a custom JavaScript code string against the RAW API RESPONSE in a secure QuickJS sandbox. " +
    "This reduces context window usage by only returning the output of your script. " +
    "Use this for local/business lookups when you only need specific fields from large local payloads. " +
    "Your script should read the 'DATA' global variable (a JSON string payload) and use console.log() to print the desired output.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Local search query (e.g. 'pizza near Central Park')",
      },
      count: {
        type: "number",
        description: "Number of results (1-20, default 5)",
        default: 5,
      },
      code: {
        type: "string",
        description: "JavaScript code to execute against the 'DATA' variable.",
      },
      language: {
        type: "string",
        description: "Language of the code. Only 'javascript' is supported.",
        default: "javascript",
      },
    },
    required: ["query", "code"],
  },
};

// Generic Code Mode Transform Tool Definition
export const CODE_MODE_TRANSFORM_TOOL: Tool = {
  name: "code_mode_transform",
  description:
    "A universal code-mode transformer. Takes RAW TEXT or JSON output from ANY MCP tool (GitHub, Firecrawl, chrome-devtools, camoufox, codegraphcontext, videoMcp, arxiv, etc.) " +
    "and runs a custom JavaScript code string against it in a secure QuickJS sandbox. " +
    "Use this as a second step after calling any tool that returns large payloads — pass the raw output as 'data' and a JS extraction script as 'code'. " +
    "Your script reads the 'DATA' global variable (a string of the tool output) and uses console.log() to print only the fields you need. " +
    "Typical use cases: extract only issue titles/IDs from GitHub list_issues, pull specific selectors from DOM snapshots, summarize crawl results, extract timestamps from video transcripts.",
  inputSchema: {
    type: "object",
    properties: {
      data: {
        type: "string",
        description: "The raw text or JSON output from another MCP tool to process.",
      },
      code: {
        type: "string",
        description:
          "JavaScript code to execute. The 'DATA' global variable contains the raw data string. Use console.log() to output your extraction. " +
          "Example: `var d = JSON.parse(DATA); console.log(d.items.map(function(i){return i.title}).join('\\n'));`",
      },
      language: {
        type: "string",
        description: "Language of the code. Only 'javascript' is supported.",
        default: "javascript",
      },
      source_tool: {
        type: "string",
        description: "Optional. Name of the MCP tool that produced the data (for logging/metrics only).",
      },
    },
    required: ["data", "code"],
  },
};

// Brave Answers Tool Definition
export const BRAVE_ANSWERS_TOOL: Tool = {
  name: "brave_answers",
  description:
    "Returns direct AI answers grounded in Brave Search using Brave AI Grounding. " +
    "Uses an OpenAI-compatible chat completions endpoint and is best for concise answer generation with live web grounding.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Question or prompt to answer",
      },
      model: {
        type: "string",
        description: "Model name for Brave AI Grounding (default: brave)",
        default: "brave",
      },
    },
    required: ["query"],
  },
};

// Research Paper Analysis Tool Definition
export const RESEARCH_PAPER_ANALYSIS_TOOL: Tool = {
  name: "gemini_research_paper_analysis",
  description:
    "Performs in-depth analysis of research papers using Google's Gemini-2.0-flash model. " +
    "Ideal for academic research, literature reviews, and deep understanding of scientific papers. " +
    "Can extract key findings, provide critical evaluation, summarize complex research, " +
    "and place papers within the broader research landscape. " +
    "Best for long-form academic content that requires expert analysis.",
  inputSchema: {
    type: "object",
    properties: {
      paperContent: {
        type: "string",
        description: "The full text of the research paper to analyze",
      },
      analysisType: {
        type: "string",
        description: "Type of analysis to perform (summary, critique, literature review, key findings, or comprehensive)",
        enum: ["summary", "critique", "literature review", "key findings", "comprehensive"],
        default: "comprehensive",
      },
      additionalContext: {
        type: "string",
        description: "Optional additional context or specific questions to guide the analysis",
      },
    },
    required: ["paperContent"],
  },
};

// Type guards for arguments
export function isBraveWebSearchArgs(
  args: unknown
): args is { query: string; count?: number; offset?: number } {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string"
  );
}

export function isBraveLocalSearchArgs(
  args: unknown
): args is { query: string; count?: number } {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string"
  );
}

export function isBraveAnswersArgs(
  args: unknown
): args is { query: string; model?: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string"
  );
}

export function isGeminiResearchPaperAnalysisArgs(
  args: unknown
): args is { paperContent: string; analysisType?: string; additionalContext?: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "paperContent" in args &&
    typeof (args as { paperContent: string }).paperContent === "string"
  );
}

export function isBraveWebSearchCodeModeArgs(
  args: unknown
): args is { query: string; count?: number; offset?: number; code: string; language?: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string" &&
    "code" in args &&
    typeof (args as { code: string }).code === "string"
  );
}

export function isBraveLocalSearchCodeModeArgs(
  args: unknown
): args is { query: string; count?: number; code: string; language?: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string" &&
    "code" in args &&
    typeof (args as { code: string }).code === "string"
  );
}

export function isCodeModeTransformArgs(
  args: unknown
): args is { data: string; code: string; language?: string; source_tool?: string } {
  return (
    typeof args === "object" &&
    args !== null &&
    "data" in args &&
    typeof (args as { data: string }).data === "string" &&
    "code" in args &&
    typeof (args as { code: string }).code === "string"
  );
}
