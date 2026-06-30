// Self-serve account deletion (POPIA §24 / GDPR Art. 17 "right to erasure").
// Authenticated users can permanently delete their own account and associated data.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    // Resolve calling user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");

    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: claims, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Best-effort cascade: remove rows owned by this user across known tables.
    // Tables with ON DELETE CASCADE on auth.users will be cleaned automatically
    // when we delete the auth user below. These are explicit just in case.
    const tables = [
      "user_memory",
      "user_roles",
      "profiles",
      "conversations",
      "chat_messages",
      "strain_journal_entries",
      "strain_reviews",
      "orders",
    ];
    const errors: Record<string, string> = {};
    for (const t of tables) {
      const { error } = await admin.from(t).delete().eq("user_id", userId);
      if (error && !/relation .* does not exist|column .* does not exist/i.test(error.message)) {
        errors[t] = error.message;
      }
    }

    // Audit log entry BEFORE auth deletion (FK to user gone afterwards).
    try {
      await admin.from("audit_log").insert({
        actor_user_id: userId,
        action: "account.delete",
        target_type: "user",
        target_id: userId,
        metadata: { partial_errors: errors },
      });
    } catch { /* table may not exist yet */ }

    // Delete the auth user (this removes the auth.users row).
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) return json({ error: "Failed to delete account", details: delErr.message }, 500);

    return json({ success: true, partial_errors: errors });
  } catch (e) {
    console.error("delete-account error", e);
    return json({ error: "Internal error" }, 500);
  }

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
