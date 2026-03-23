/**
 * Agent Registry Handlers (v3.0 — Agent Hivemind)
 *
 * Handler implementations for the 3 agent registry MCP tools.
 * These are only called when PRISM_ENABLE_HIVEMIND=true.
 */

import { getStorage } from "../storage/index.js";
import { PRISM_USER_ID } from "../config.js";
import { getRoleIcon } from "./agentRegistryDefinitions.js";

// ─── Type Guards ─────────────────────────────────────────────

function isAgentRegisterArgs(args: Record<string, unknown>): args is {
  project: string;
  role: string;
  agent_name?: string;
  current_task?: string;
} {
  return typeof args.project === "string" && typeof args.role === "string";
}

function isAgentHeartbeatArgs(args: Record<string, unknown>): args is {
  project: string;
  role: string;
  current_task?: string;
} {
  return typeof args.project === "string" && typeof args.role === "string";
}

function isAgentListTeamArgs(args: Record<string, unknown>): args is {
  project: string;
} {
  return typeof args.project === "string";
}

// ─── Handlers ────────────────────────────────────────────────

export async function agentRegisterHandler(args: Record<string, unknown>) {
  if (!isAgentRegisterArgs(args)) {
    return {
      content: [{ type: "text" as const, text: "Missing required: project, role" }],
      isError: true,
    };
  }

  const storage = await getStorage();
  const result = await storage.registerAgent({
    project: args.project,
    user_id: PRISM_USER_ID,
    role: args.role,
    agent_name: (args.agent_name as string) || null,
    status: "active",
    current_task: (args.current_task as string) || null,
  });

  const icon = getRoleIcon(args.role);
  return {
    content: [{
      type: "text" as const,
      text:
        `${icon} **Agent Registered**\n\n` +
        `- **Project:** ${args.project}\n` +
        `- **Role:** ${args.role}\n` +
        (args.agent_name ? `- **Name:** ${args.agent_name}\n` : "") +
        (args.current_task ? `- **Task:** ${args.current_task}\n` : "") +
        `\nOther agents will see you when they call \`agent_list_team\` or \`session_load_context\`.`,
    }],
  };
}

export async function agentHeartbeatHandler(args: Record<string, unknown>) {
  if (!isAgentHeartbeatArgs(args)) {
    return {
      content: [{ type: "text" as const, text: "Missing required: project, role" }],
      isError: true,
    };
  }

  const storage = await getStorage();
  await storage.heartbeatAgent(
    args.project,
    PRISM_USER_ID,
    args.role,
    args.current_task as string | undefined
  );

  return {
    content: [{
      type: "text" as const,
      text: `💓 Heartbeat updated for **${args.role}** on \`${args.project}\`.` +
        (args.current_task ? ` Task: ${args.current_task}` : ""),
    }],
  };
}

export async function agentListTeamHandler(args: Record<string, unknown>) {
  if (!isAgentListTeamArgs(args)) {
    return {
      content: [{ type: "text" as const, text: "Missing required: project" }],
      isError: true,
    };
  }

  const storage = await getStorage();
  const team = await storage.listTeam(args.project, PRISM_USER_ID);

  if (team.length === 0) {
    return {
      content: [{
        type: "text" as const,
        text: `No active agents on \`${args.project}\`. Use \`agent_register\` to join the team.`,
      }],
    };
  }

  const lines = team.map(agent => {
    const icon = getRoleIcon(agent.role);
    const ago = agent.last_heartbeat
      ? getTimeAgo(agent.last_heartbeat)
      : "unknown";
    return (
      `${icon} **${agent.role}**` +
      (agent.agent_name ? ` (${agent.agent_name})` : "") +
      ` — ${agent.status}` +
      (agent.current_task ? ` | Task: ${agent.current_task}` : "") +
      ` | Last seen: ${ago}`
    );
  });

  return {
    content: [{
      type: "text" as const,
      text:
        `## 🐝 Active Hivemind Team — \`${args.project}\`\n\n` +
        lines.join("\n") +
        `\n\n_${team.length} agent(s) active. Stale agents (>30min) auto-pruned._`,
    }],
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function getTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}
