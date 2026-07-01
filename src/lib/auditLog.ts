import { supabase } from "@/integrations/supabase/client";

/**
 * Record an audit event for admin actions, data exports, or policy changes.
 * Writes are executed server-side via the `log_audit_event` SECURITY DEFINER
 * function, which stamps the current auth.uid() and email automatically.
 *
 * Failures are logged but never thrown — audit logging must not break UX.
 */
export async function logAuditEvent(params: {
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { error } = await supabase.rpc("log_audit_event", {
      _action: params.action,
      _target_type: params.targetType ?? null,
      _target_id: params.targetId ?? null,
      _metadata: (params.metadata ?? {}) as never,
      _ip_address: null,
      _user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    if (error) console.warn("[audit] log failed", error.message);
  } catch (e) {
    console.warn("[audit] log threw", e);
  }
}
