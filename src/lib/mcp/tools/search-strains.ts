import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export default defineTool({
  name: "search_strains",
  title: "Search cannabis strains",
  description:
    "Search the Cuddles AI public strain catalog. Filter by category (e.g. sleep, energy, creativity, stress, pain, social) or free-text query on strain name.",
  inputSchema: {
    query: z.string().optional().describe("Optional strain name substring."),
    category: z
      .string()
      .optional()
      .describe("Optional effect category: sleep, energy, creativity, stress, pain, social."),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, category, limit }) => {
    const sb = supabase();
    let q = sb
      .from("tenant_strains")
      .select("strain_name, strain_type, category, primary_terpene, secondary_terpene, primary_effect, notes, thc_min, thc_max, in_stock")
      .eq("in_stock", true)
      .limit(limit ?? 10);
    if (category) q = q.ilike("category", `%${category}%`);
    if (query) q = q.ilike("strain_name", `%${query}%`);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { strains: data ?? [] },
    };
  },
});
