import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Upload, Plus, Copy, Users } from "lucide-react";
import { REFERRAL_CAMPAIGN_HTML, REFERRAL_CAMPAIGN_SUBJECT } from "@/lib/campaigns/referralCampaign";
import { NEWSLETTER_CAMPAIGN_HTML, NEWSLETTER_CAMPAIGN_SUBJECT } from "@/lib/campaigns/newsletterCampaign";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/SEO";

const SOURCES = [
  { id: "app_users", label: "Signed-up app users" },
  { id: "newsletter_subscribers", label: "Newsletter subscribers" },
  { id: "email_leads", label: "Email leads" },
] as const;

const CAMPAIGNS = [
  { id: "newsletter", label: "Newsletter invite", subject: NEWSLETTER_CAMPAIGN_SUBJECT, html: NEWSLETTER_CAMPAIGN_HTML },
  { id: "referral", label: "Referral", subject: REFERRAL_CAMPAIGN_SUBJECT, html: REFERRAL_CAMPAIGN_HTML },
];

interface BrevoList {
  id: number;
  name: string;
  totalSubscribers?: number;
  uniqueSubscribers?: number;
}

const call = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("brevo-sync", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.details ?? data.error);
  return data;
};

const BrevoSync = () => {
  const [lists, setLists] = useState<BrevoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [newListName, setNewListName] = useState("Cuddles Newsletter Invite");
  const [creating, setCreating] = useState(false);
  const [sources, setSources] = useState<string[]>(SOURCES.map((s) => s.id));

  const loadLists = async () => {
    setLoading(true);
    try {
      const data = await call({ action: "lists" });
      setLists(data.lists ?? []);
    } catch (err) {
      toast.error("Could not load Brevo lists", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLists();
  }, []);

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    try {
      await call({ action: "create_list", name: newListName.trim() });
      toast.success("List created in Brevo");
      await loadLists();
    } catch (err) {
      toast.error("Could not create list", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSync = async (listId: number) => {
    if (sources.length === 0) {
      toast.error("Pick at least one contact source");
      return;
    }
    setSyncing(listId);
    try {
      const data = await call({ action: "sync", listId, sources });
      toast.success(`Synced ${data.synced} contacts to Brevo`);
      await loadLists();
    } catch (err) {
      toast.error("Sync failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleInvite = async (listId: number) => {
    if (!confirm("Email every signed-up user asking if they want the newsletter? (up to 250 per day, already-invited people are skipped)")) return;
    setSyncing(-listId);
    try {
      const data = await call({ action: "invite_optin", listId });
      toast.success(`Invites sent: ${data.sent}`, {
        description: `${data.failed} failed · ${data.remaining} left for tomorrow. People who click "Yes" join this list.`,
      });
    } catch (err) {
      toast.error("Invite failed", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setSyncing(null);
    }
  };

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const toggleSource = (id: string) =>
    setSources((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 space-y-6">
      <SEO
        title="Brevo Bulk Email Admin | Cuddles AI"
        description="Internal Cuddles AI admin tool for syncing subscribers and sending bulk Brevo email campaigns."
        url="/admin/brevo"
        noindex
      />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Brevo bulk email</h1>
        <p className="text-muted-foreground">
          Push newsletter subscribers and leads into a Brevo list, then design and send the campaign in Brevo.
          Unsubscribed and bounced addresses are excluded automatically.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Brevo lists</CardTitle>
            <CardDescription>Sync contacts into any list</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadLists()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lists.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">No lists yet — create one below.</p>
          )}
          {lists.map((list) => (
            <div
              key={list.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{list.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {list.totalSubscribers ?? list.uniqueSubscribers ?? 0} contacts
                  <Badge variant="secondary" className="ml-2">ID {list.id}</Badge>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => void handleInvite(list.id)} disabled={syncing !== null}>
                  {syncing === -list.id ? "Sending…" : "Invite sign-ups"}
                </Button>
                <Button size="sm" onClick={() => void handleSync(list.id)} disabled={syncing !== null}>
                  <Upload className={`h-4 w-4 mr-2 ${syncing === list.id ? "animate-pulse" : ""}`} />
                  {syncing === list.id ? "Syncing…" : "Sync contacts"}
                </Button>
              </div>
            </div>
          ))}

          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-medium">Contact sources to sync</p>
            {SOURCES.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <Checkbox checked={sources.includes(s.id)} onCheckedChange={() => toggleSource(s.id)} />
                {s.label}
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list name"
              maxLength={100}
            />
            <Button variant="outline" onClick={() => void handleCreate()} disabled={creating}>
              <Plus className="h-4 w-4 mr-2" />
              Create list
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign templates</CardTitle>
          <CardDescription>Preview, then copy the HTML into Brevo's code editor</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="newsletter">
            <TabsList>
              {CAMPAIGNS.map((c) => (
                <TabsTrigger key={c.id} value={c.id}>{c.label}</TabsTrigger>
              ))}
            </TabsList>
            {CAMPAIGNS.map((c) => (
              <TabsContent key={c.id} value={c.id} className="space-y-4 pt-4">
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <span className="text-muted-foreground">Subject: </span>
                  <span className="font-medium">{c.subject}</span>
                </div>
                <div
                  className="rounded-lg border bg-muted/30 p-4 max-h-96 overflow-auto"
                  // Static, first-party template preview.
                  dangerouslySetInnerHTML={{ __html: c.html }}
                />
                <div className="flex gap-2">
                  <Button onClick={() => void copyText(c.html, "Campaign HTML")}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML
                  </Button>
                  <Button variant="outline" onClick={() => void copyText(c.subject, "Subject line")}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy subject
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to send the bulk email</CardTitle>
          <CardDescription>Takes about 5 minutes end to end</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="text-sm list-decimal pl-5 space-y-2">
            <li>
              <strong>Create the list:</strong> type a name above (e.g. "Cuddles Newsletter Invite") and
              click <em>Create list</em>.
            </li>
            <li>
              <strong>Pick your sources:</strong> tick "Signed-up app users" to reach everyone with an
              account, plus leads/subscribers if you want a wider blast.
            </li>
            <li>
              <strong>Sync:</strong> click <em>Sync contacts</em> on that list. Unsubscribed, bounced and
              complained addresses are removed automatically.
            </li>
            <li>
              <strong>Copy the template:</strong> open the <em>Newsletter invite</em> tab above and copy
              both the subject line and the HTML.
            </li>
            <li>
              <strong>In Brevo:</strong> Campaigns → Create a campaign → Email → give it a name → paste
              the subject → choose <em>Design with: Paste your code</em> and paste the HTML.
            </li>
            <li>
              <strong>Recipients:</strong> select the synced list. Sender must be an address on your
              verified domain (notify.cuddles-ai.com).
            </li>
            <li>
              <strong>Test first:</strong> use "Send a test" to your own inbox, check it on mobile, then
              hit <em>Send now</em> or schedule it.
            </li>
            <li>
              <strong>Check results:</strong> Brevo → Statistics shows opens, clicks and unsubscribes per
              campaign.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrevoSync;
