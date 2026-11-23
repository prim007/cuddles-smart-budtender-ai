// databricks-analytics: admin-only bridge between Cuddles data and Databricks.
//
// Actions:
//   { action: "warehouses" }                        -> list SQL warehouses
//   { action: "query", warehouse_id, statement }    -> run a READ-ONLY SQL statement
//   { action: "export", warehouse_id, catalog, schema, tables[] }
//        -> copy Cuddles tables into Databricks (CREATE TABLE + batched INSERTs)
//
// All Databricks traffic goes through the Lovable connector gateway.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/databricks";
const INSERT_BATCH = 200;
const MAX_ROWS = 5000;

// Only these Cuddles tables may be exported, with the columns that are safe to ship.
// Tables also specify a sort column for deterministic batching.
const EXPORTABLE: Record<string, { columns: string[]; sort: string }> = {
  chat_conversations: { columns: ["id", "session_id", "user_message", "assistant_message", "created_at"], sort: "created_at" },
  tenant_strains: {
    columns: [
      "id", "tenant_id", "strain_name", "strain_type", "category", "primary_effect",
      "primary_terpene", "thc_min", "thc_max", "cbd_min", "cbd_max", "price", "in_stock", "created_at",
    ],
    sort: "created_at",
  },
  tenants: { columns: ["id", "business_name", "plan", "status", "store_count", "pos_system", "created_at"], sort: "created_at" },
  delivery_orders: {
    columns: [
      "id", "status", "subtotal", "delivery_fee", "total", "distance_km",
      "estimated_delivery_minutes", "created_at",
    ],
    sort: "created_at",
  },
  delivery_order_items: { columns: ["id", "order_id", "strain_id", "strain_name", "quantity", "unit_price", "total_price", "created_at"], sort: "created_at" },
  strain_reviews: { columns: ["id", "strain_name", "strain_type", "rating", "helpful_count", "created_at"], sort: "created_at" },
  strain_journal: { columns: ["id", "strain_name", "strain_type", "consumption_method", "rating", "mood_before", "mood_after", "session_date"], sort: "session_date" },
  email_leads: { columns: ["id", "source", "subscribed", "used", "created_at"], sort: "created_at" },
  ab_events: { columns: ["id", "experiment", "variant", "event_name", "path", "created_at"], sort: "created_at" },
  ui_feedback: { columns: ["id", "note", "path", "created_at"], sort: "created_at" },
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function databricks(path: string, init: { method: string; body?: unknown }) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const dbxKey = Deno.env.get("DATABRICKS_API_KEY");
  if (!lovableKey) throw new Error("[500]: LOVABLE_API_KEY is not configured");
  if (!dbxKey) throw new Error("[500]: DATABRICKS_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method: init.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": dbxKey,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`databricks-analytics: gateway failed [${res.status}] ${path}: ${text}`);
    throw new Error(`[${res.status}]: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function runSql(warehouseId: string, statement: string) {
  const result = await databricks("/2.0/sql/statements", {
    method: "POST",
    body: { warehouse_id: warehouseId, statement, wait_timeout: "50s", on_wait_timeout: "CANCEL" },
  });
  const state = result?.status?.state;
  if (state === "FAILED" || state === "CANCELED") {
    throw new Error(`[400]: ${result?.status?.error?.message ?? "Statement failed"}`);
  }
  return result;
}

const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const READ_ONLY_RE = /^\s*(select|with|show|describe|desc|explain)\b/i;
const FORBIDDEN_RE = /\b(drop|delete|truncate|alter|grant|revoke|insert|update|merge)\b/i;

function literal(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    const userId = userData?.user?.id as string | undefined;
    if (userError || !userId) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "warehouses");

    if (action === "warehouses") {
      const data = await databricks("/2.0/sql/warehouses", { method: "GET" });
      return json({ warehouses: data.warehouses ?? [], exportable: Object.keys(EXPORTABLE) }, 200);
    }

    // Export destination is fixed server-side; request-supplied warehouse,
    // catalog and schema values are never used as the target.
    const warehouseId = (Deno.env.get("DATABRICKS_EXPORT_WAREHOUSE_ID") ?? "").trim();
    if (action === "export" && !warehouseId) {
      return json({ error: "Export destination is not configured" }, 400);
    }

    if (action === "query") {
      // Free-form SQL was removed: callers may not supply statements. Only the
      // allowlisted export below runs server-built SQL.
      return json({ error: "Custom queries are disabled. Use export instead." }, 400);
    }

    if (action === "export") {
      const catalog = (Deno.env.get("DATABRICKS_EXPORT_CATALOG") ?? "main").trim();
      const schema = (Deno.env.get("DATABRICKS_EXPORT_SCHEMA") ?? "cuddles_ai_export").trim();
      if (!IDENT_RE.test(catalog) || !IDENT_RE.test(schema)) {
        return json({ error: "Export destination is misconfigured" }, 500);
      }
      const requested: string[] = Array.isArray(body?.tables) && body.tables.length
        ? body.tables.map(String)
        : Object.keys(EXPORTABLE);
      const tables = requested.filter((t) => t in EXPORTABLE);
      if (!tables.length) return json({ error: "No exportable tables selected" }, 400);

      await runSql(warehouseId, `CREATE SCHEMA IF NOT EXISTS \`${catalog}\`.\`${schema}\``);

      const summary: { table: string; rows: number }[] = [];

      for (const table of tables) {
        const { columns, sort } = EXPORTABLE[table];
        const { data, error } = await admin
          .from(table)
          .select(columns.join(", "))
          .order(sort, { ascending: false, nullsFirst: false })
          .limit(MAX_ROWS);

        if (error) {
          console.error(`databricks-analytics: read ${table} failed`, error);
          return json({ error: `Could not read ${table}` }, 500);
        }

        const target = `\`${catalog}\`.\`${schema}\`.\`cuddles_${table}\``;
        await runSql(
          warehouseId,
          `CREATE TABLE IF NOT EXISTS ${target} (${columns.map((c) => `\`${c}\` STRING`).join(", ")})`,
        );
        await runSql(warehouseId, `TRUNCATE TABLE ${target}`);

        const rows = (data ?? []) as Record<string, unknown>[];
        for (let i = 0; i < rows.length; i += INSERT_BATCH) {
          const slice = rows.slice(i, i + INSERT_BATCH);
          const values = slice
            .map((row) => `(${columns.map((c) => literal(row[c])).join(", ")})`)
            .join(", ");
          await runSql(warehouseId, `INSERT INTO ${target} VALUES ${values}`);
        }

        summary.push({ table, rows: rows.length });
      }

      return json({ exported: summary, catalog, schema, prefix: "cuddles_" }, 200);
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("databricks-analytics: failed", message);
    const match = /^\[(\d{3})\]: /.exec(message);
    const status = match ? Number(match[1]) : 500;
    return json({ error: "Databricks request failed", details: message }, status);
  }
});
