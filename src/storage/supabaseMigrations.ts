/**
 * Supabase Auto-Migration Runner (v4.1)
 *
 * On server startup, this module checks the `prism_schema_versions` table
 * and applies any pending DDL migrations via the `prism_apply_ddl` RPC.
 *
 * ═══════════════════════════════════════════════════════════════════
 * HOW IT WORKS:
 *   1. For each migration in MIGRATIONS[], call prism_apply_ddl(version, name, sql)
 *   2. The Postgres function checks if the version is already applied (idempotent)
 *   3. If not applied, it EXECUTE's the SQL and records the version
 *
 * GRACEFUL DEGRADATION:
 *   If prism_apply_ddl doesn't exist (PGRST202), the runner logs a
 *   warning and skips — the server still starts, but v4+ tools may
 *   fail against an old schema.
 *
 * SECURITY NOTE:
 *   prism_apply_ddl is SECURITY DEFINER (runs as postgres owner).
 *   The prism_schema_versions table has RLS: only service_role can write.
 * ═══════════════════════════════════════════════════════════════════
 */

import { supabaseRpc } from "../utils/supabaseApi.js";

// ─── Migration Definitions ───────────────────────────────────────
// Add new migrations here. The version number must be unique and
// monotonically increasing. The SQL must be idempotent (use IF NOT EXISTS).

export interface Migration {
  version: number;
  name: string;
  sql: string;
}

/**
 * All Supabase DDL migrations.
 *
 * IMPORTANT: Only add migrations for schema changes that Supabase
 * users need. SQLite handles its own schema in sqlite.ts.
 *
 * Each `sql` string is passed to Postgres EXECUTE — it runs as a
 * single transaction. Use IF NOT EXISTS / IF EXISTS guards generously.
 */
export const MIGRATIONS: Migration[] = [
  {
    version: 26,
    name: "active_behavioral_memory",
    sql: `
      -- v4.0: Active Behavioral Memory columns
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'session';
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT NULL;
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS importance INTEGER NOT NULL DEFAULT 0;

      -- Soft-delete / archival columns
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS deleted_reason TEXT DEFAULT NULL;

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_ledger_event_type ON session_ledger(event_type);
      CREATE INDEX IF NOT EXISTS idx_ledger_importance ON session_ledger(importance DESC);

      -- Partial index for high-priority warnings
      CREATE INDEX IF NOT EXISTS idx_ledger_behavioral_warnings
        ON session_ledger(project, user_id, role, importance DESC)
        WHERE event_type = 'correction' AND importance >= 3
          AND deleted_at IS NULL AND archived_at IS NULL;
    `,
  },
  {
    version: 28,
    name: "importance_rpcs",
    sql: `
      -- Fix #4: Atomic importance adjustment — eliminates read-then-write race condition
      CREATE OR REPLACE FUNCTION prism_adjust_importance(
        p_id TEXT, p_user_id TEXT, p_delta INTEGER
      )
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        UPDATE session_ledger
        SET importance = GREATEST(0, importance + p_delta)
        WHERE id = p_id AND user_id = p_user_id;
      END;
      $$;

      -- Fix #5: Importance decay — parity with SQLite backend
      CREATE OR REPLACE FUNCTION prism_decay_importance(
        p_project TEXT, p_user_id TEXT, p_days INTEGER
      )
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        UPDATE session_ledger
        SET importance = GREATEST(0, importance - 1)
        WHERE project = p_project
          AND user_id = p_user_id
          AND importance > 0
          AND event_type <> 'session'
          AND created_at < now() - (p_days || ' days')::interval
          AND deleted_at IS NULL
          AND archived_at IS NULL;
      END;
      $$;
    `,
  },
  {
    version: 29,
    name: "turboquant_compressed_embeddings",
    sql: `
      -- v5.0: TurboQuant Compressed Embedding columns
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS embedding_compressed TEXT DEFAULT NULL;
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS embedding_format TEXT DEFAULT NULL;
      ALTER TABLE session_ledger ADD COLUMN IF NOT EXISTS embedding_turbo_radius REAL DEFAULT NULL;
    `,
  },
  // Future migrations go here (version 30+)
];

/**
 * Current schema version — derived from the MIGRATIONS array.
 * Automatically updates when new migrations are added.
 * Used for logging and diagnostics.
 */
export const CURRENT_SCHEMA_VERSION =
  MIGRATIONS.length > 0 ? MIGRATIONS[MIGRATIONS.length - 1].version : 27;

// ─── Runner ──────────────────────────────────────────────────────

/**
 * Run all pending auto-migrations on Supabase startup.
 *
 * Called from SupabaseStorage.initialize(). Non-fatal: if the
 * migration infrastructure (027) hasn't been applied, the runner
 * logs a warning and returns silently.
 */
export async function runAutoMigrations(): Promise<void> {
  if (MIGRATIONS.length === 0) {
    return; // Nothing to apply
  }

  console.error(
    `[Prism Auto-Migration] Schema v${CURRENT_SCHEMA_VERSION} — checking ${MIGRATIONS.length} migration(s)…`
  );

  for (const migration of MIGRATIONS) {
    try {
      const result = await supabaseRpc("prism_apply_ddl", {
        p_version: migration.version,
        p_name: migration.name,
        p_sql: migration.sql,
      });

      // Parse the JSON result from the RPC
      const data = (typeof result === "string" ? JSON.parse(result) : result) as {
        status: string;
        version: number;
      };

      if (data?.status === "applied") {
        console.error(
          `[Prism Auto-Migration] ✅ Applied migration ${migration.version}: ${migration.name}`
        );
      } else if (data?.status === "already_applied") {
        // Silent skip — expected for idempotent restarts
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);

      // PGRST202 = function not found → migration infra (027) not applied yet
      if (errMsg.includes("PGRST202") || errMsg.includes("Could not find the function")) {
        console.error(
          "[Prism Auto-Migration] ⚠️  prism_apply_ddl() not found. " +
            "Apply migration 027_auto_migration_infra.sql to enable auto-migrations.\n" +
            "  Run: supabase db push  (or apply the SQL in the Supabase Dashboard SQL Editor)"
        );
        return; // Stop — no point trying further migrations
      }

      // Any other error: log and throw to surface the problem
      console.error(
        `[Prism Auto-Migration] ❌ Migration ${migration.version} (${migration.name}) failed: ${errMsg}`
      );
      throw err;
    }
  }
}
