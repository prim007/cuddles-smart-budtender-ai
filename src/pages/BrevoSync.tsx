import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Upload, Plus, Copy, Users } from "lucide-react";
import { REFERRAL_CAMPAIGN_HTML, REFERRAL_CAMPAIGN_SUBJECT } from "@/lib/campaigns/referralCampaign";

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
  const [newListName, setNewListName] = useState("Cuddles Referral Campaign");
  const [creating, setCreating] = useState(false);

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
    setSyncing(listId);
    try {
      const data = await call({ action: "sync", listId });
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

  const copyCampaign = async () => {
    await navigator.clipboard.writeText(REFERRAL_CAMPAIGN_HTML);
    toast.success("Campaign HTML copied — paste it into Brevo's code editor");
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 space-y-6">
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
              <Button size="sm" onClick={() => void handleSync(list.id)} disabled={syncing !== null}>
                <Upload className={`h-4 w-4 mr-2 ${syncing === list.id ? "animate-pulse" : ""}`} />
                {syncing === list.id ? "Syncing…" : "Sync contacts"}
              </Button>
            </div>
          ))}

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
          <CardTitle>Referral campaign template</CardTitle>
          <CardDescription>
            Subject: <span className="font-medium">{REFERRAL_CAMPAIGN_SUBJECT}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="rounded-lg border bg-muted/30 p-4 max-h-80 overflow-auto"
            // Static, first-party template preview.
            dangerouslySetInnerHTML={{ __html: REFERRAL_CAMPAIGN_HTML }}
          />
          <Button onClick={() => void copyCampaign()}>
            <Copy className="h-4 w-4 mr-2" />
            Copy campaign HTML
          </Button>
          <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
            <li>Sync contacts into a list above.</li>
            <li>In Brevo: Campaigns → Create → Email → paste this HTML in the code editor.</li>
            <li>Pick the synced list as the recipients and send or schedule.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrevoSync;
