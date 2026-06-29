import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, ExternalLink, Mail, RefreshCw, Store } from "lucide-react";
import SEO from "@/components/SEO";

interface Tenant {
  id: string;
  business_name: string | null;
  business_email: string | null;
  phone: string | null;
  website: string | null;
  pos_system: string | null;
  plan: string | null;
  status: string | null;
  embed_key: string | null;
  branding_color: string | null;
  created_at: string;
}

const WidgetOutreach = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tenants")
      .select("id,business_name,business_email,phone,website,pos_system,plan,status,embed_key,branding_color,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load tenants", description: error.message, variant: "destructive" });
    } else {
      setTenants((data ?? []) as Tenant[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const snippet = (key: string | null, color: string | null) =>
    key
      ? `<script src="https://cuddles-ai.com/widget.js"\n  data-key="${key}"\n  data-color="${color || "#10b981"}"\n  data-position="right"\n  defer></script>`
      : "";

  const copySnippet = async (t: Tenant) => {
    const text = snippet(t.embed_key, t.branding_color);
    if (!text) {
      toast({ title: "No embed key yet", variant: "destructive" });
      return;
    }
    await navigator.clipboard.writeText(text);
    toast({ title: "Snippet copied 🎉", description: `Paste it into ${t.business_name}'s site.` });
  };

  const sendInstallEmail = async (t: Tenant) => {
    if (!t.business_email) {
      toast({ title: "No email on file", variant: "destructive" });
      return;
    }
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "dispensary-welcome",
        recipientEmail: t.business_email,
        idempotencyKey: `widget-install-${t.id}-${Date.now()}`,
        templateData: {
          businessName: t.business_name ?? "there",
          embedSnippet: snippet(t.embed_key, t.branding_color),
        },
      },
    });
    if (error) {
      toast({ title: "Email failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Install email queued 📬", description: `Sent to ${t.business_email}` });
    }
  };

  const statusVariant = (status: string | null): "default" | "secondary" | "outline" | "destructive" => {
    if (status === "active") return "default";
    if (status === "trial") return "secondary";
    if (status === "churned") return "destructive";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <SEO title="Widget Outreach — Admin" noindex url="/admin/widget-outreach" />
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back home
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">Dispensary Widget Outreach</h1>
            <p className="text-sm text-muted-foreground">
              Push the Cuddles chat widget to every dispensary on the platform. Each install brings a brand-new audience into the chat.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading tenants…</div>
        ) : tenants.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Store className="mx-auto mb-3 h-8 w-8" />
            No dispensary tenants yet. Once a dispensary completes onboarding they will appear here.
          </Card>
        ) : (
          <div className="grid gap-4">
            {tenants.map((t) => (
              <Card key={t.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-foreground">{t.business_name ?? "Untitled dispensary"}</h2>
                      <Badge variant={statusVariant(t.status)}>{t.status ?? "unknown"}</Badge>
                      {t.plan && <Badge variant="outline">{t.plan}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.business_email ?? "no email"} · {t.pos_system ?? "no POS"}
                    </p>
                    {t.website && (
                      <a href={t.website} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        {t.website} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => copySnippet(t)} disabled={!t.embed_key}>
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy snippet
                    </Button>
                    <Button size="sm" onClick={() => sendInstallEmail(t)} disabled={!t.business_email || !t.embed_key}>
                      <Mail className="mr-1.5 h-3.5 w-3.5" /> Send install email
                    </Button>
                  </div>
                </div>
                {t.embed_key && (
                  <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-[11px] text-muted-foreground">
                    {snippet(t.embed_key, t.branding_color)}
                  </pre>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetOutreach;
