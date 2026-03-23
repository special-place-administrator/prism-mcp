/**
 * Agent Registry Tool Definitions (v3.0 — Agent Hivemind)
 *
 * Three new MCP tools for multi-agent coordination:
 *   - agent_register: Register an agent with project + role
 *   - agent_heartbeat: Update heartbeat + current task
 *   - agent_list_team: List active agents on a project
 *
 * These tools are ONLY registered when PRISM_ENABLE_HIVEMIND=true
 * (see server.ts). This prevents increasing the tool count for
 * users who don't need multi-agent features.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

// ─── Role Icons (for dashboard + responses) ──────────────────

export const ROLE_ICONS: Record<string, string> = {
  dev: "🛠️",
  qa: "🔍",
  pm: "📋",
  lead: "🏗️",
  security: "🔒",
  ux: "🎨",
  cmo: "📢",
  global: "🌐",
};

/** Get icon for a role, with fallback for custom roles (Pro-Tip 4) */
export function getRoleIcon(role: string): string {
  return ROLE_ICONS[role.toLowerCase()] || "🤖";
}

// ─── Tool Definitions ────────────────────────────────────────

export const AGENT_REGISTER_TOOL: Tool = {
  name: "agent_register",
  description:
    "Register this agent with the Hivemind team for a project. " +
    "Announces your role and current task to other agents. " +
    "If already registered, updates the existing entry. " +
    "Other agents will see you when they call agent_list_team or session_load_context.",
  inputSchema: {
    type: "object",
    properties: {
      project: {
        type: "string",
        description: "Project identifier (e.g., 'prism-mcp').",
      },
      role: {
        type: "string",
        description:
          "Your agent role. Common roles: 'dev', 'qa', 'pm', 'lead', 'security', 'ux'. " +
          "Custom roles are also supported (e.g., 'translator', 'docs').",
      },
      agent_name: {
        type: "string",
        description: "Optional human-readable name for this agent (e.g., 'Backend Dev #1').",
      },
      current_task: {
        type: "string",
        description: "Optional description of what you're currently working on.",
      },
    },
    required: ["project", "role"],
  },
};

export const AGENT_HEARTBEAT_TOOL: Tool = {
  name: "agent_heartbeat",
  description:
    "Update your heartbeat and optionally your current task. " +
    "Call this periodically to stay visible to the team. " +
    "Agents that haven't sent a heartbeat in 30 minutes are auto-pruned.",
  inputSchema: {
    type: "object",
    properties: {
      project: {
        type: "string",
        description: "Project identifier.",
      },
      role: {
        type: "string",
        description: "Your agent role.",
      },
      current_task: {
        type: "string",
        description: "Optional updated description of your current task.",
      },
    },
    required: ["project", "role"],
  },
};

export const AGENT_LIST_TEAM_TOOL: Tool = {
  name: "agent_list_team",
  description:
    "List all active agents on a project. Shows role, status, current task, " +
    "and last heartbeat time. Automatically prunes agents that haven't " +
    "reported in 30+ minutes.",
  inputSchema: {
    type: "object",
    properties: {
      project: {
        type: "string",
        description: "Project identifier.",
      },
    },
    required: ["project"],
  },
};

/** All Hivemind agent registry tools — conditionally registered */
export const AGENT_REGISTRY_TOOLS: Tool[] = [
  AGENT_REGISTER_TOOL,
  AGENT_HEARTBEAT_TOOL,
  AGENT_LIST_TEAM_TOOL,
];
