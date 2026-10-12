import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Public key — safe in the browser. Private half lives server-side.
const VAPID_PUBLIC_KEY = "BIN5X67gWaJdd-2C5wpNLAWZrS2mfBZrwbP4-Si_dixv9xxfwPsoaqBUNo7bAQQh0OiKMLmTZTBV5YnhZViXmYE";
const SW_URL = "/push/push-sw.js";
const SW_SCOPE = "/push/";

type Status = "checking" | "unsupported" | "iframe" | "denied" | "off" | "on";

function urlB64ToUint8Array(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const SMOKE_OPTIONS = [null, 2, 3, 4, 6] as const;
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);

const PushAlertsCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState({ tbreak_alerts: true, daily_checkin: true, checkin_hour: 19, smoke_break_hours: null as number | null });

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setStatus("unsupported");
      if (window.top !== window.self) return setStatus("iframe");
      if (Notification.permission === "denied") return setStatus("denied");
      const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE);
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("push_preferences").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setPrefs({ tbreak_alerts: data.tbreak_alerts, daily_checkin: data.daily_checkin, checkin_hour: data.checkin_hour, smoke_break_hours: data.smoke_break_hours });
    });
  }, [user]);

  const savePrefs = async (next: typeof prefs) => {
    setPrefs(next);
    if (!user) return;
    const { error } = await supabase.from("push_preferences").upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() });
    if (error) toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
  };

  const enable = async () => {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setStatus(perm === "denied" ? "denied" : "off"); return; }
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
      await navigator.serviceWorker.ready.catch(() => undefined);
      const sub = (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY) }));
      const { error } = await supabase.functions.invoke("push-subscribe", { body: { action: "subscribe", subscription: sub.toJSON() } });
      if (error) throw error;
      await supabase.functions.invoke("push-subscribe", { body: { action: "test" } });
      setStatus("on");
      toast({ title: "Alerts are on", description: "We just sent you a test alert." });
    } catch (e) {
      console.error(e);
      toast({ title: "Couldn't turn on alerts", description: "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await supabase.functions.invoke("push-subscribe", { body: { action: "unsubscribe", endpoint: sub.endpoint } });
      await sub.unsubscribe();
    }
    setStatus("off");
    setBusy(false);
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-primary" aria-hidden="true" /> Phone alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {status === "unsupported" && (
          <p className="text-sm text-muted-foreground">This browser can't show alerts. On iPhone, first tap Share → "Add to Home Screen", then open Cuddles from your home screen.</p>
        )}
        {status === "iframe" && (
          <p className="text-sm text-muted-foreground">Open Cuddles in its own tab (or on cuddles-ai.com) to turn on alerts.</p>
        )}
        {status === "denied" && (
          <p className="text-sm text-muted-foreground">Alerts are blocked. Allow notifications for this site in your browser settings, then reload.</p>
        )}
        {status === "off" && (
          <Button size="lg" onClick={enable} disabled={busy} className="w-full sm:w-auto">
            {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bell className="mr-2 h-5 w-5" />} Turn on alerts
          </Button>
        )}
        {status === "on" && (
          <>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pa-tbreak" className="text-base">T-break milestones & "You made it!"</Label>
              <Switch id="pa-tbreak" checked={prefs.tbreak_alerts} onCheckedChange={(v) => savePrefs({ ...prefs, tbreak_alerts: v })} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pa-checkin" className="text-base">Daily check-in reminder</Label>
              <Switch id="pa-checkin" checked={prefs.daily_checkin} onCheckedChange={(v) => savePrefs({ ...prefs, daily_checkin: v })} />
            </div>
            {prefs.daily_checkin && (
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="pa-hour" className="text-base">Remind me at</Label>
                <select id="pa-hour" className="h-11 rounded-md border border-input bg-background px-3 text-base"
                  value={prefs.checkin_hour} onChange={(e) => savePrefs({ ...prefs, checkin_hour: Number(e.target.value) })}>
                  {HOURS.map((h) => <option key={h} value={h}>{`${String(h).padStart(2, "0")}:00`}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="pa-smoke" className="text-base">Smoke-break reminder</Label>
              <select id="pa-smoke" className="h-11 rounded-md border border-input bg-background px-3 text-base"
                value={prefs.smoke_break_hours ?? ""} onChange={(e) => savePrefs({ ...prefs, smoke_break_hours: e.target.value ? Number(e.target.value) : null })}>
                {SMOKE_OPTIONS.map((h) => <option key={h ?? "off"} value={h ?? ""}>{h ? `Every ${h} hours` : "Off"}</option>)}
              </select>
            </div>
            <Button variant="outline" onClick={disable} disabled={busy}>
              <BellOff className="mr-2 h-4 w-4" /> Turn off alerts on this device
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PushAlertsCard;
