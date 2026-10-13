// brevo-sync: admin-only bridge that pushes Cuddles subscribers into a Brevo list
// so bulk campaigns can be designed and sent from Brevo.
//
// Actions:
//   { action: "lists" }                        -> list Brevo contact lists
//   { action: "create_list", name: "..." }     -> create a new Brevo list
//   { action: "sync", listId: 3, sources: [...] } -> upsert contacts into a list
//
// All Brevo traffic goes through the Lovable connector gateway.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";
const BATCH_SIZE = 100;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function brevo(path: string, init: { method: string; body?: unknown }) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (!lovableKey) throw new Error("[500]: LOVABLE_API_KEY is not configured");
  if (!brevoKey) throw new Error("[500]: BREVO_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method: init.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": brevoKey,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`brevo-sync: gateway request failed [${res.status}]`);
    throw new Error(`[${res.status}]: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    const userId = claimsData?.claims?.sub as string | undefined;
    if (claimsError || !userId) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "lists");

    if (action === "lists") {
      const data = await brevo("/contacts/lists?limit=50&offset=0", { method: "GET" });
      return json({ lists: data.lists ?? [] }, 200);
    }

    if (action === "create_list") {
      const name = String(body?.name ?? "").trim();
      if (!name || name.length > 100) return json({ error: "Invalid list name" }, 400);
      // Brevo requires a folder; use the first available one.
      const folders = await brevo("/contacts/folders?limit=10&offset=0", { method: "GET" });
      const folderId = folders?.folders?.[0]?.id ?? 1;
      const created = await brevo("/contacts/lists", {
        method: "POST",
        body: { name, folderId },
      });
      return json({ list: created }, 200);
    }

    if (action === "sync") {
      const listId = Number(body?.listId);
      if (!Number.isFinite(listId) || listId <= 0) return json({ error: "Invalid listId" }, 400);

      const sources: string[] = Array.isArray(body?.sources) && body.sources.length
        ? body.sources.map(String)
        : ["newsletter_subscribers", "email_leads", "app_users"];

      const contacts = new Map<string, Record<string, unknown>>();

      if (sources.includes("app_users")) {
        // Signed-up app users (auth). Paginated, capped at 5k.
        for (let page = 1; page <= 50; page++) {
          const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
          if (error) {
            console.error("brevo-sync: listUsers failed", error);
            break;
          }
          const users = data?.users ?? [];
          for (const u of users) {
            const email = String(u.email ?? "").trim().toLowerCase();
            if (!EMAIL_RE.test(email)) continue;
            contacts.set(email, {
              FIRSTNAME: (u.user_metadata?.full_name ?? u.user_metadata?.name ?? "") as string,
              SOURCE: "app_signup",
            });
          }
          if (users.length < 100) break;
        }
      }

      if (sources.includes("newsletter_subscribers")) {
        const { data, error } = await admin
          .from("newsletter_subscribers")
          .select("email, name, status")
          .limit(5000);
        if (error) {
          console.error("brevo-sync: newsletter_subscribers query failed", error);
          return json({ error: "Could not load subscribers" }, 500);
        }
        for (const row of data ?? []) {
          const email = String(row.email ?? "").trim().toLowerCase();
          if (!EMAIL_RE.test(email)) continue;
          if (row.status && !["confirmed", "subscribed", "active"].includes(String(row.status))) continue;
          contacts.set(email, { FIRSTNAME: row.name ?? "", SOURCE: "newsletter" });
        }
      }

      if (sources.includes("email_leads")) {
        const { data, error } = await admin
          .from("email_leads")
          .select("email, source, subscribed")
          .limit(5000);
        if (error) {
          console.error("brevo-sync: email_leads query failed", error);
          return json({ error: "Could not load leads" }, 500);
        }
        for (const row of data ?? []) {
          const email = String(row.email ?? "").trim().toLowerCase();
          if (!EMAIL_RE.test(email)) continue;
          if (row.subscribed === false) continue;
          if (!contacts.has(email)) {
            contacts.set(email, { SOURCE: row.source ?? "lead" });
          }
        }
      }

      // Never push anyone who has bounced, complained or unsubscribed.
      const { data: suppressed } = await admin.from("suppressed_emails").select("email").limit(5000);
      for (const row of suppressed ?? []) {
        contacts.delete(String(row.email ?? "").trim().toLowerCase());
      }

      const entries = [...contacts.entries()];
      if (!entries.length) return json({ synced: 0, batches: 0 }, 200);

      let batches = 0;
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const slice = entries.slice(i, i + BATCH_SIZE);
        await brevo("/contacts/import", {
          method: "POST",
          body: {
            listIds: [listId],
            updateExistingContacts: true,
            emailBlacklist: false,
            smsBlacklist: false,
            jsonBody: slice.map(([email, attributes]) => ({ email, attributes })),
          },
        });
        batches++;
      }

      return json({ synced: entries.length, batches, listId }, 200);
    }

    if (action === "invite_optin") {
      // Brevo double opt-in: Brevo emails each person a "Do you want the newsletter?"
      // message; only people who click the confirm button are added to the list.
      const listId = Number(body?.listId);
      if (!Number.isFinite(listId) || listId <= 0) return json({ error: "Invalid listId" }, 400);
      const maxSends = Math.min(Math.max(Number(body?.limit) || 250, 1), 280); // Brevo free = 300/day

      const senders = await brevo("/senders", { method: "GET" });
      const sender = (senders?.senders ?? []).find((s: { active?: boolean }) => s.active);
      if (!sender) return json({ error: "No verified sender in Brevo. Add and verify a sender email in Brevo first." }, 400);

      // Find or create the opt-in template (Brevo requires tag "optin" + {{ doubleoptin }} link).
      const TEMPLATE_NAME = "Cuddles AI newsletter invite";
      const templateBody = {
        templateName: TEMPLATE_NAME,
        tag: "optin",
        isActive: true,
        sender: { email: sender.email, name: "Cuddles AI" },
        subject: "Would you like the Cuddles AI newsletter? 🌿",
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#3d2f45;line-height:1.6">
 <h1 style="color:#d94a64;font-size:24px">Hi from Cuddles AI 👋</h1>
 <p>Thank you for signing up to Cuddles AI. We send a short, free newsletter with plant and strain guides, South African cannabis law updates and partner specials.</p>
 <p><strong>Would you like to receive it?</strong></p>
 <p><a href="{{ doubleoptin }}" style="display:inline-block;background:#d94a64;color:#fff;padding:14px 26px;border-radius:12px;text-decoration:none;font-weight:bold">Yes, subscribe me</a></p>
 <p style="font-size:13px;color:#888">Not interested? Just ignore this email — you won't be added. Education only, not medical advice.</p>
 <p>Stay lifted,<br/>The Cuddles AI Team</p></div>`,
      };
      const tpls = await brevo("/smtp/templates?limit=100&offset=0", { method: "GET" });
      let templateId = (tpls?.templates ?? []).find((t: { name: string }) => t.name === TEMPLATE_NAME)?.id;
      if (templateId) {
        // Keep the existing template in sync with the code above (sender name, copy).
        await brevo(`/smtp/templates/${templateId}`, { method: "PUT", body: templateBody });
      } else {
        const created = await brevo("/smtp/templates", { method: "POST", body: templateBody });
        templateId = created?.id;
      }
      if (!templateId) return json({ error: "Could not create the invite template in Brevo" }, 500);

      const emails = new Set<string>();
      const provided = Array.isArray(body?.emails) ? body.emails.slice(0, 1000) : null;
      if (provided) {
        for (const raw of provided) {
          const e = String(raw ?? "").trim().toLowerCase();
          if (EMAIL_RE.test(e)) emails.add(e);
        }
      }
      if (!provided) for (let page = 1; page <= 50; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
        if (error) break;
        for (const u of data?.users ?? []) {
          const e = String(u.email ?? "").trim().toLowerCase();
          if (EMAIL_RE.test(e)) emails.add(e);
        }
        if ((data?.users ?? []).length < 100) break;
      }
      const { data: suppressed } = await admin.from("suppressed_emails").select("email").limit(5000);
      for (const r of suppressed ?? []) emails.delete(String(r.email).toLowerCase());
      // Skip people already subscribed or already invited.
      const { data: logged } = await admin.from("email_send_log").select("recipient_email")
        .eq("template_name", "brevo-newsletter-invite").limit(5000);
      for (const r of logged ?? []) emails.delete(String(r.recipient_email).toLowerCase());
      const { data: subs } = await admin.from("newsletter_subscribers").select("email, status").limit(5000);
      for (const r of subs ?? []) if (r.status === "confirmed") emails.delete(String(r.email).toLowerCase());

      // Test mode: send to a single address only, regardless of the collected set.
      const testEmail = String(body?.testEmail ?? "").trim().toLowerCase();
      if (testEmail) {
        if (!EMAIL_RE.test(testEmail)) return json({ error: "Invalid testEmail" }, 400);
        emails.clear();
        emails.add(testEmail);
      }

      const redirectionUrl = "https://cuddles-ai.com/?newsletter=confirmed";
      let sent = 0, failed = 0;
      for (const email of [...emails].slice(0, maxSends)) {
        try {
          await brevo("/contacts/doubleOptinConfirmation", {
            method: "POST",
            body: { email, includeListIds: [listId], templateId, redirectionUrl, attributes: { SOURCE: "app_signup" } },
          });
          await admin.from("email_send_log").insert({
            template_name: "brevo-newsletter-invite", recipient_email: email, status: "sent",
          });
          sent++;
        } catch (e) {
          console.error("brevo-sync invite failed", e instanceof Error ? e.message.replace(/[^\s@]+@[^\s@]+/g, "[redacted]") : "unknown");
          failed++;
        }
      }
      return json({ sent, failed, remaining: Math.max(emails.size - sent - failed, 0), listId }, 200);
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("brevo-sync: failed", message.replace(/[^\s@]+@[^\s@]+/g, "[redacted]"));
    const match = /^\[(\d{3})\]: /.exec(message);
    const status = match ? Number(match[1]) : 500;
    return json({ error: "Brevo request failed", details: message }, status);
  }
});
