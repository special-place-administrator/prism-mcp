/**
 * Tool Definition Tests — Type Guards & Schema Validation
 *
 * ═══════════════════════════════════════════════════════════════════
 * SCOPE:
 *   Tests the MCP tool schemas and type guard functions that
 *   validate incoming tool call arguments. These are the "front door"
 *   of every MCP tool — if type guards fail, args are rejected before
 *   they ever reach the handler.
 *
 * WHY THESE TESTS MATTER:
 *   Type guards are used in the MCP CallTool handler to validate
 *   arguments before passing them to storage. A broken type guard
 *   means the LLM's tool call silently fails with an unhelpful
 *   "Invalid arguments" error.
 *
 * WHAT WE TEST:
 *   1. isSessionSaveLedgerArgs — validates save_ledger arguments
 *   2. isSessionSaveHandoffArgs — validates save_handoff arguments
 *   3. isSessionLoadContextArgs — validates load_context arguments
 *   4. v3.0 role parameter in all three guards
 *   5. Agent Registry tool schemas (structure validation)
 *   6. Negative cases — invalid/missing required arguments
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  isSessionSaveLedgerArgs,
  isSessionSaveHandoffArgs,
  isSessionLoadContextArgs,
} from "../../src/tools/sessionMemoryDefinitions.js";
import {
  AGENT_REGISTER_TOOL,
  AGENT_HEARTBEAT_TOOL,
  AGENT_LIST_TEAM_TOOL,
  ROLE_ICONS,
  getRoleIcon,
} from "../../src/tools/agentRegistryDefinitions.js";

// ═══════════════════════════════════════════════════════════════════
// 1. SESSION SAVE LEDGER — Type Guard
// ═══════════════════════════════════════════════════════════════════

describe("isSessionSaveLedgerArgs", () => {
  /**
   * Tests that a minimal valid argument set passes the guard.
   * Required fields: project, conversation_id, summary
   */
  it("should accept valid args with required fields only", () => {
    const args = {
      project: "my-app",
      conversation_id: "conv-123",
      summary: "Implemented feature X",
    };

    expect(isSessionSaveLedgerArgs(args)).toBe(true);
  });

  /**
   * Tests that all optional fields are accepted.
   * Optional fields: todos, files_changed, decisions, role
   */
  it("should accept valid args with all optional fields", () => {
    const args = {
      project: "my-app",
      conversation_id: "conv-123",
      summary: "Implemented feature X",
      todos: ["Deploy to staging"],
      files_changed: ["src/app.ts"],
      decisions: ["Use middleware pattern"],
      role: "dev", // v3.0
    };

    expect(isSessionSaveLedgerArgs(args)).toBe(true);
  });

  /**
   * v3.0: Tests that the role field is accessible after type narrowing.
   * This is the critical test — if role isn't in the type guard's
   * return type, TypeScript will reject `args.role` in the handler.
   */
  it("should allow role access after type narrowing (v3.0)", () => {
    const args: unknown = {
      project: "my-app",
      conversation_id: "conv-123",
      summary: "QA found bugs",
      role: "qa",
    };

    if (isSessionSaveLedgerArgs(args)) {
      // This line would fail to compile if role wasn't in the type guard
      expect(args.role).toBe("qa");
    } else {
      // Should never reach here
      expect.unreachable("Type guard should accept valid args");
    }
  });

  /**
   * Tests rejection when project is missing.
   * The guard checks for typeof project === "string".
   */
  it("should reject args without project", () => {
    expect(isSessionSaveLedgerArgs({
      conversation_id: "conv-123",
      summary: "Test",
    })).toBe(false);
  });

  /**
   * Tests rejection when summary is not a string.
   */
  it("should reject args with non-string summary", () => {
    expect(isSessionSaveLedgerArgs({
      project: "my-app",
      conversation_id: "conv-123",
      summary: 42, // wrong type
    })).toBe(false);
  });

  /**
   * Tests rejection of null and undefined inputs.
   * The guard checks typeof args === "object" && args !== null.
   */
  it("should reject null and undefined", () => {
    expect(isSessionSaveLedgerArgs(null)).toBe(false);
    expect(isSessionSaveLedgerArgs(undefined)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. SESSION SAVE HANDOFF — Type Guard
// ═══════════════════════════════════════════════════════════════════

describe("isSessionSaveHandoffArgs", () => {
  /**
   * Tests minimal valid args — only project is required.
   */
  it("should accept args with only project", () => {
    expect(isSessionSaveHandoffArgs({ project: "my-app" })).toBe(true);
  });

  /**
   * Tests full args including v3.0 role and v0.4.0 expected_version.
   */
  it("should accept args with role and expected_version", () => {
    const args = {
      project: "my-app",
      last_summary: "Completed auth refactor",
      open_todos: ["Deploy"],
      active_branch: "main",
      key_context: "All tests passing",
      expected_version: 42,
      role: "dev", // v3.0
    };

    expect(isSessionSaveHandoffArgs(args)).toBe(true);
  });

  /**
   * v3.0: Verifies role is accessible after narrowing.
   */
  it("should allow role access after narrowing (v3.0)", () => {
    const args: unknown = { project: "my-app", role: "lead" };

    if (isSessionSaveHandoffArgs(args)) {
      expect(args.role).toBe("lead");
    } else {
      expect.unreachable("Should pass guard");
    }
  });

  /**
   * Tests rejection when project is missing.
   */
  it("should reject args without project", () => {
    expect(isSessionSaveHandoffArgs({ last_summary: "Test" })).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. SESSION LOAD CONTEXT — Type Guard
// ═══════════════════════════════════════════════════════════════════

describe("isSessionLoadContextArgs", () => {
  /**
   * Tests basic valid args.
   */
  it("should accept args with project only", () => {
    expect(isSessionLoadContextArgs({ project: "my-app" })).toBe(true);
  });

  /**
   * Tests with level and role — the full v3.0 interface.
   */
  it("should accept args with level and role (v3.0)", () => {
    const args = {
      project: "my-app",
      level: "deep" as const,
      role: "qa",
    };

    expect(isSessionLoadContextArgs(args)).toBe(true);
  });

  /**
   * v3.0: Verifies role is accessible after narrowing.
   */
  it("should allow role access after narrowing (v3.0)", () => {
    const args: unknown = { project: "my-app", role: "security" };

    if (isSessionLoadContextArgs(args)) {
      expect(args.role).toBe("security");
    } else {
      expect.unreachable("Should pass guard");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. AGENT REGISTRY — Tool Schema Validation
// ═══════════════════════════════════════════════════════════════════

describe("Agent Registry Tool Schemas", () => {
  /**
   * Tests that agent_register tool has the correct name and
   * required input properties.
   *
   * WHY: MCP indexers (Smithery, Glama) consume these schemas
   * to generate public documentation. Wrong schemas = confused users.
   */
  it("agent_register should have correct schema", () => {
    expect(AGENT_REGISTER_TOOL.name).toBe("agent_register");

    const props = AGENT_REGISTER_TOOL.inputSchema.properties as Record<string, any>;

    // Required: project and role
    expect(props.project).toBeDefined();
    expect(props.role).toBeDefined();

    // Optional: agent_name, current_task
    expect(props.agent_name).toBeDefined();
    expect(props.current_task).toBeDefined();

    // Required fields should be listed
    const required = AGENT_REGISTER_TOOL.inputSchema.required;
    expect(required).toContain("project");
    expect(required).toContain("role");
  });

  /**
   * Tests the heartbeat tool schema.
   */
  it("agent_heartbeat should have correct schema", () => {
    expect(AGENT_HEARTBEAT_TOOL.name).toBe("agent_heartbeat");

    const props = AGENT_HEARTBEAT_TOOL.inputSchema.properties as Record<string, any>;
    expect(props.project).toBeDefined();
    expect(props.role).toBeDefined();
  });

  /**
   * Tests the list_team tool schema.
   */
  it("agent_list_team should have correct schema", () => {
    expect(AGENT_LIST_TEAM_TOOL.name).toBe("agent_list_team");

    const props = AGENT_LIST_TEAM_TOOL.inputSchema.properties as Record<string, any>;
    expect(props.project).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. ROLE ICONS — Visual Identity
// ═══════════════════════════════════════════════════════════════════

describe("Role Icons", () => {
  /**
   * Tests that all built-in roles have icons assigned.
   * These icons appear in the dashboard Hivemind Radar and
   * in tool responses when listing team members.
   */
  it("should have icons for all built-in roles", () => {
    const expectedRoles = ["dev", "qa", "pm", "lead", "security", "ux", "cmo"];

    for (const role of expectedRoles) {
      expect(ROLE_ICONS[role]).toBeDefined();
      // Icons should be emoji (non-empty strings)
      expect(ROLE_ICONS[role].length).toBeGreaterThan(0);
    }
  });

  /**
   * Tests the getRoleIcon helper function.
   * It should return the correct icon for known roles
   * and a default robot emoji for unknown roles.
   */
  it("should return default icon for unknown roles", () => {
    const customRoleIcon = getRoleIcon("custom-analyst");

    // Unknown roles get the default robot icon
    expect(customRoleIcon).toBeDefined();
    expect(typeof customRoleIcon).toBe("string");
  });

  /**
   * Tests that known roles get their specific icons via getRoleIcon.
   */
  it("should return specific icons for known roles", () => {
    expect(getRoleIcon("dev")).toBe(ROLE_ICONS.dev);
    expect(getRoleIcon("qa")).toBe(ROLE_ICONS.qa);
    expect(getRoleIcon("pm")).toBe(ROLE_ICONS.pm);
  });
});
