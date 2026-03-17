import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { SERVER_CONFIG } from "./config.js";
import {
  WEB_SEARCH_TOOL,
  BRAVE_WEB_SEARCH_CODE_MODE_TOOL,
  LOCAL_SEARCH_TOOL,
  BRAVE_LOCAL_SEARCH_CODE_MODE_TOOL,
  CODE_MODE_TRANSFORM_TOOL,
  BRAVE_ANSWERS_TOOL,
  RESEARCH_PAPER_ANALYSIS_TOOL,
  webSearchHandler,
  braveWebSearchCodeModeHandler,
  localSearchHandler,
  braveLocalSearchCodeModeHandler,
  codeModeTransformHandler,
  braveAnswersHandler,
  researchPaperAnalysisHandler,
} from "./tools/index.js";

// Create MCP server
export function createServer() {
  console.error(`Creating MCP server with name: ${SERVER_CONFIG.name}, version: ${SERVER_CONFIG.version}`);

  const server = new Server(
    {
      name: SERVER_CONFIG.name,
      version: SERVER_CONFIG.version,
    },
    {
      capabilities: {
        tools: {
          tools: [WEB_SEARCH_TOOL, BRAVE_WEB_SEARCH_CODE_MODE_TOOL, LOCAL_SEARCH_TOOL, BRAVE_LOCAL_SEARCH_CODE_MODE_TOOL, CODE_MODE_TRANSFORM_TOOL, BRAVE_ANSWERS_TOOL, RESEARCH_PAPER_ANALYSIS_TOOL],
        },
      },
    }
  );

  // Register initialize handler
  server.setRequestHandler(InitializeRequestSchema, async (request) => {
    console.error(`Received initialize request from client: ${request.params.clientInfo?.name || 'unknown'}`);

    // Respond immediately to initialize
    return {
      protocolVersion: request.params.protocolVersion,
      serverInfo: {
        name: SERVER_CONFIG.name,
        version: SERVER_CONFIG.version,
      },
      capabilities: {
        tools: {
          tools: [WEB_SEARCH_TOOL, BRAVE_WEB_SEARCH_CODE_MODE_TOOL, LOCAL_SEARCH_TOOL, BRAVE_LOCAL_SEARCH_CODE_MODE_TOOL, CODE_MODE_TRANSFORM_TOOL, BRAVE_ANSWERS_TOOL, RESEARCH_PAPER_ANALYSIS_TOOL],
        },
      },
    };
  });

  // Register tool listing handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received list tools request");
    return {
      tools: [WEB_SEARCH_TOOL, BRAVE_WEB_SEARCH_CODE_MODE_TOOL, LOCAL_SEARCH_TOOL, BRAVE_LOCAL_SEARCH_CODE_MODE_TOOL, CODE_MODE_TRANSFORM_TOOL, BRAVE_ANSWERS_TOOL, RESEARCH_PAPER_ANALYSIS_TOOL],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    console.error(`Received call tool request for: ${request.params.name}`);

    try {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new Error("No arguments provided");
      }

      console.error(`Processing ${name} with arguments: ${JSON.stringify(args)}`);

      switch (name) {
        case "brave_web_search":
          return await webSearchHandler(args);

        case "brave_web_search_code_mode":
          return await braveWebSearchCodeModeHandler(args);

        case "brave_local_search":
          return await localSearchHandler(args);

        case "brave_local_search_code_mode":
          return await braveLocalSearchCodeModeHandler(args);

        case "code_mode_transform":
          return await codeModeTransformHandler(args);

        case "brave_answers":
          return await braveAnswersHandler(args);

        case "gemini_research_paper_analysis":
          return await researchPaperAnalysisHandler(args);

        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } catch (error) {
      console.error(`Error in tool handler: ${error instanceof Error ? error.message : String(error)}`);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Start server with stdio transport
export async function startServer() {
  console.error("Initializing server...");
  const server = createServer();

  console.error("Creating stdio transport...");
  const transport = new StdioServerTransport();

  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("Brave Search MCP Server running on stdio");

  // Keep the process alive
  setInterval(() => {
    // Heartbeat to keep the process running
  }, 10000);
}

startServer().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});

