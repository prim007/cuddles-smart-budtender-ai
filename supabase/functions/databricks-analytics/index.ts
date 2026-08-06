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
const EXPORTABLE: Record<string, string[]> = {
  chat_conversations: ["id", "session_id", "user_message", "assistant_message", "created_at"],
  tenant_strains: [
    "id", "tenant_id", "strain_name", "strain_type", "category", "primary_effect",
    "primary_terpene", "thc_min", "thc_max", "cbd_min", "cbd_max", "price", "in_stock", "created_at",
  ],
  tenants: ["id", "business_name", "plan", "status", "store_count", "pos_system", "created_at"],
  delivery_orders: [
    "id", "status", "subtotal", "delivery_fee", "total", "distance_km",
    "estimated_delivery_minutes", "created_at",
  ],
  delivery_order_items: ["id", "order_id", "strain_id", "strain_name", "quantity", "unit_price", "total_price", "created_at"],
  strain_reviews: ["id", "strain_name", "strain_type", "rating", "helpful_count", "created_at"],
  strain_journal: ["id", "strain_name", "strain_type", "consumption_method", "rating", "mood_before", "mood_after", "session_date"],
  email_leads: ["id", "source", "subscribed", "used", "created_at"],
  ab_events: ["id", "experiment", "variant", "event_name", "path", "created_at"],
  ui_feedback: ["id", "note", "path", "created_at"],
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
    body: { warehouse_id: warehouseId, statement, wait_timeout: "30s" },
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

    const warehouseId = String(body?.warehouse_id ?? "").trim();
    if (!warehouseId) return json({ error: "warehouse_id is required" }, 400);

    if (action === "query") {
      const statement = String(body?.statement ?? "").trim();
      if (!statement || statement.length > 5000) return json({ error: "Invalid statement" }, 400);
      if (!READ_ONLY_RE.test(statement) || FORBIDDEN_RE.test(statement)) {
        return json({ error: "Only read-only statements (SELECT / SHOW / DESCRIBE) are allowed" }, 400);
      }
      const result = await runSql(warehouseId, statement);
      return json(
        {
          columns: (result?.manifest?.schema?.columns ?? []).map((c: { name: string }) => c.name),
          rows: result?.result?.data_array ?? [],
          row_count: result?.manifest?.total_row_count ?? 0,
        },
        200,
      );
    }

    if (action === "export") {
      const catalog = String(body?.catalog ?? "").trim();
      const schema = String(body?.schema ?? "").trim();
      if (!IDENT_RE.test(catalog) || !IDENT_RE.test(schema)) {
        return json({ error: "Invalid catalog or schema name" }, 400);
      }
      const requested: string[] = Array.isArray(body?.tables) && body.tables.length
        ? body.tables.map(String)
        : Object.keys(EXPORTABLE);
      const tables = requested.filter((t) => t in EXPORTABLE);
      if (!tables.length) return json({ error: "No exportable tables selected" }, 400);

      await runSql(warehouseId, `CREATE SCHEMA IF NOT EXISTS \`${catalog}\`.\`${schema}\``);

      const summary: { table: string; rows: number }[] = [];

      for (const table of tables) {
        const columns = EXPORTABLE[table];
        const { data, error } = await admin
          .from(table)
          .select(columns.join(", "))
          .order("created_at", { ascending: false, nullsFirst: false })
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
