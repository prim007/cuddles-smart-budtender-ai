// snowflake-analytics: admin-only bridge between Cuddles data and Snowflake.
//
// Actions:
//   { action: "warehouses" }                          -> list Snowflake warehouses + exportable tables
//   { action: "query", warehouse, statement }         -> run a READ-ONLY SQL statement
//   { action: "export", warehouse, database, schema, tables[] }
//        -> copy Cuddles tables into Snowflake (CREATE TABLE + batched INSERTs)
//
// All Snowflake traffic goes through the Lovable connector gateway.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPORT_DATABASE = "CUDDLES_ANALYTICS";
const EXPORT_SCHEMA = "PUBLIC";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/snowflake";
const INSERT_BATCH = 200;
const MAX_ROWS = 5000;

// Only these Cuddles tables may be exported, with the columns safe to ship.
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
    columns: ["id", "status", "subtotal", "delivery_fee", "total", "distance_km", "estimated_delivery_minutes", "created_at"],
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

async function snowflake(body: Record<string, unknown>) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const sfKey = Deno.env.get("SNOWFLAKE_API_KEY");
  if (!lovableKey) throw new Error("[500]: LOVABLE_API_KEY is not configured");
  if (!sfKey) throw new Error("[500]: SNOWFLAKE_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}/v2/statements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": sfKey,
    },
    body: JSON.stringify({ timeout: 60, ...body }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`snowflake-analytics: gateway failed [${res.status}]: ${text}`);
    throw new Error(`[${res.status}]: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

const IDENT_RE = /^[A-Za-z_][A-Za-z0-9_$]*$/;

function literal(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function rowsOf(result: Record<string, any>) {
  return {
    columns: (result?.resultSetMetaData?.rowType ?? []).map((c: { name: string }) => c.name),
    rows: result?.data ?? [],
    row_count: result?.resultSetMetaData?.numRows ?? (result?.data?.length ?? 0),
  };
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
      // SHOW is a metadata command and needs no warehouse.
      const result = await snowflake({ statement: "SHOW WAREHOUSES" });
      const cols = (result?.resultSetMetaData?.rowType ?? []).map((c: { name: string }) => c.name);
      const nameIdx = cols.indexOf("name");
      const stateIdx = cols.indexOf("state");
      const warehouses = (result?.data ?? []).map((r: string[]) => ({
        name: r[nameIdx],
        state: stateIdx >= 0 ? r[stateIdx] : undefined,
      }));
      return json({ warehouses, exportable: Object.keys(EXPORTABLE) }, 200);
    }

    const warehouse = String(body?.warehouse ?? "").trim();
    if (!IDENT_RE.test(warehouse)) return json({ error: "A valid warehouse is required" }, 400);

    if (action === "query") {
      // No caller-supplied SQL reaches Snowflake. The caller picks one of the
      // Cuddles tables we export and a row count; the statement is built here
      // from that allowlist, so no other data in the warehouse is reachable.
      const table = String(body?.table ?? "").trim();
      if (!(table in EXPORTABLE)) {
        return json({ error: "Pick one of the exported Cuddles tables", tables: Object.keys(EXPORTABLE) }, 400);
      }
      const database = EXPORT_DATABASE;
      const schema = EXPORT_SCHEMA;
      if (!IDENT_RE.test(database) || !IDENT_RE.test(schema)) {
        return json({ error: "Invalid database or schema name" }, 400);
      }
      const limit = Math.min(Math.max(Number(body?.limit) || 50, 1), 1000);
      const { columns, sort } = EXPORTABLE[table];
      const target = `"${database}"."${schema}"."CUDDLES_${table.toUpperCase()}"`;
      const statement =
        `SELECT ${columns.map((c) => `"${c.toUpperCase()}"`).join(", ")} FROM ${target} ` +
        `ORDER BY "${sort.toUpperCase()}" DESC LIMIT ${limit}`;
      const result = await snowflake({ statement, warehouse });
      return json({ ...rowsOf(result), table, statement }, 200);
    }

    if (action === "export") {
      // Fixed destination: never let the request choose where tables get truncated.
      const database = EXPORT_DATABASE;
      const schema = EXPORT_SCHEMA;
      const requested: string[] = Array.isArray(body?.tables) && body.tables.length
        ? body.tables.map(String)
        : Object.keys(EXPORTABLE);
      const tables = requested.filter((t) => t in EXPORTABLE);
      if (!tables.length) return json({ error: "No exportable tables selected" }, 400);

      await snowflake({ statement: `CREATE DATABASE IF NOT EXISTS "${database}"`, warehouse });
      await snowflake({ statement: `CREATE SCHEMA IF NOT EXISTS "${database}"."${schema}"`, warehouse });

      const summary: { table: string; rows: number }[] = [];

      for (const table of tables) {
        const { columns, sort } = EXPORTABLE[table];
        const { data, error } = await admin
          .from(table)
          .select(columns.join(", "))
          .order(sort, { ascending: false, nullsFirst: false })
          .limit(MAX_ROWS);

        if (error) {
          console.error(`snowflake-analytics: read ${table} failed`, error);
          return json({ error: `Could not read ${table}` }, 500);
        }

        const target = `"${database}"."${schema}"."CUDDLES_${table.toUpperCase()}"`;
        await snowflake({
          statement: `CREATE TABLE IF NOT EXISTS ${target} (${columns.map((c) => `"${c.toUpperCase()}" STRING`).join(", ")})`,
          warehouse,
        });
        await snowflake({ statement: `TRUNCATE TABLE ${target}`, warehouse });

        const rows = (data ?? []) as Record<string, unknown>[];
        for (let i = 0; i < rows.length; i += INSERT_BATCH) {
          const values = rows
            .slice(i, i + INSERT_BATCH)
            .map((row) => `(${columns.map((c) => literal(row[c])).join(", ")})`)
            .join(", ");
          await snowflake({ statement: `INSERT INTO ${target} VALUES ${values}`, warehouse });
        }

        summary.push({ table, rows: rows.length });
      }

      return json({ exported: summary, database, schema, prefix: "CUDDLES_" }, 200);
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("snowflake-analytics: failed", message);
    const match = /^\[(\d{3})\]: /.exec(message);
    const status = match ? Number(match[1]) : 500;
    return json({ error: "Snowflake request failed", details: message }, status);
  }
});
