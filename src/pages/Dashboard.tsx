import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SEO from "@/components/SEO";
import { staticBlogPosts } from "@/data/staticBlogPosts";
import { rankMatches, sharedLikes, type LikesProfile } from "@/lib/likeMatch";
import { BookOpen, Camera, Star, Heart, Sprout, MessageCircle, Copy, Check, UserPlus, Send, X, Inbox } from "lucide-react";

const EFFECTS = ["Relaxed", "Creative", "Sleep", "Energy", "Focus", "Pain relief", "Happy", "Appetite"];
const FLAVOURS = ["Citrus", "Earthy", "Sweet", "Pine", "Berry", "Diesel", "Spicy", "Floral"];
const TOPICS = ["Growing", "Laws & news", "Health & wellness", "Plant care", "Strain guides", "Dispensaries"];

const TOOLS = [
  { icon: BookOpen, title: "My Journal", href: "/journal" },
  { icon: Camera, title: "Strain Scanner", href: "/scanner" },
  { icon: Star, title: "Reviews", href: "/reviews" },
  { icon: Heart, title: "T-Break Coach", href: "/t-break" },
  { icon: Sprout, title: "My Grow", href: "/grow" },
  { icon: MessageCircle, title: "Budtender", href: "/budtender" },
];

type Profile = LikesProfile & { discoverable: boolean };
interface Conn { id: string; requester_id: string; addressee_id: string; status: string }
interface Share { id: string; sender_id: string; recipient_id: string; item_type: string; item_slug: string; item_title: string; note: string | null; is_read: boolean; created_at: string }

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const Chips = ({ options, value, onToggle }: { options: string[]; value: string[]; onToggle: (v: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => {
      const on = value.includes(o);
      return (
        <button key={o} type="button" onClick={() => onToggle(o)} aria-pressed={on}
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"}`}>
          {on && <Check className="inline w-3 h-3 mr-1" />}{o}
        </button>
      );
    })}
  </div>
);

const Dashboard = () => {
  const { user, displayName } = useAuth();
  const { toast } = useToast();
  const [me, setMe] = useState<Profile | null>(null);
  const [others, setOthers] = useState<Profile[]>([]);
  const [conns, setConns] = useState<Conn[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [strainInput, setStrainInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareTo, setShareTo] = useState<string>("");
  const [shareKind, setShareKind] = useState<"article" | "strain">("article");
  const [shareValue, setShareValue] = useState("");
  const [shareNote, setShareNote] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    let { data: mine } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (!mine) {
      const { data } = await supabase.from("profiles").insert({ user_id: user.id, display_name: displayName || "Cuddles friend" }).select().maybeSingle();
      mine = data;
    }
    setMe(mine as Profile);
    const [{ data: all }, { data: c }, { data: s }] = await Promise.all([
      supabase.from("profiles").select("user_id,display_name,liked_effects,liked_flavours,liked_topics,favourite_strains,discoverable").neq("user_id", user.id).limit(500),
      supabase.from("connections").select("id,requester_id,addressee_id,status"),
      supabase.from("shared_items").select("*").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(30),
    ]);
    setOthers((all ?? []) as Profile[]);
    setConns((c ?? []) as Conn[]);
    setShares((s ?? []) as Share[]);
  }, [user, displayName]);

  useEffect(() => { load(); }, [load]);

  const save = async (patch: Partial<Profile>) => {
    if (!me || !user) return;
    const next = { ...me, ...patch };
    setMe(next);
    const { error } = await supabase.from("profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (error) toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
  };

  const toggle = (key: "liked_effects" | "liked_flavours" | "liked_topics", v: string) => {
    if (!me) return;
    const cur = me[key];
    save({ [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } as Partial<Profile>);
  };

  const nameOf = (id: string) => others.find((o) => o.user_id === id)?.display_name ?? "A Cuddles friend";
  const otherId = (c: Conn) => (c.requester_id === user?.id ? c.addressee_id : c.requester_id);
  const friends = conns.filter((c) => c.status === "accepted");
  const incoming = conns.filter((c) => c.status === "pending" && c.addressee_id === user?.id);
  const outgoing = conns.filter((c) => c.status === "pending" && c.requester_id === user?.id);

  const matches = useMemo(() => {
    if (!me) return [];
    const exclude = new Set(conns.filter((c) => c.status !== "declined").map(otherId));
    return rankMatches(me, others.filter((o) => o.discoverable), exclude).slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, others, conns]);

  const invite = async (id: string) => {
    const { error } = await supabase.from("connections").insert({ requester_id: user!.id, addressee_id: id });
    if (error) toast({ title: "Invite not sent", description: "You may already be connected.", variant: "destructive" });
    else { toast({ title: "Invite sent 🌿" }); load(); }
  };
  const respond = async (id: string, status: "accepted" | "declined") => {
    // Declining removes the row so either person can invite again later;
    // the pair unique index would otherwise block them forever.
    if (status === "declined") await supabase.from("connections").delete().eq("id", id);
    else await supabase.from("connections").update({ status }).eq("id", id);
    load();
  };
  const remove = async (id: string) => { await supabase.from("connections").delete().eq("id", id); load(); };

  const inviteLink = user ? `${window.location.origin}/invite/${user.id}` : "";
  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendShare = async () => {
    if (!shareTo || !shareValue) return;
    let slug = shareValue, title = shareValue;
    if (shareKind === "article") {
      const post = staticBlogPosts.find((p) => p.slug === shareValue);
      if (!post) return;
      title = post.title;
    } else {
      slug = slugify(shareValue);
      title = shareValue.trim();
    }
    const { error } = await supabase.from("shared_items").insert({
      sender_id: user!.id, recipient_id: shareTo, item_type: shareKind, item_slug: slug, item_title: title.slice(0, 200), note: shareNote.trim().slice(0, 300) || null,
    });
    if (error) toast({ title: "Couldn't share", description: "You can only share with connected friends.", variant: "destructive" });
    else { toast({ title: "Shared 💛" }); setShareValue(""); setShareNote(""); }
  };

  const dismissShare = async (id: string) => {
    await supabase.from("shared_items").delete().eq("id", id);
    setShares((s) => s.filter((x) => x.id !== id));
  };

  if (!me) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading your dashboard…</div>;

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <SEO title="My Dashboard | Cuddles AI" description="Your personal Cuddles space: tools, likes and friends." />
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        <header>
          <p className="text-primary text-sm font-medium uppercase tracking-wider">My Cuddles</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Hi {me.display_name} 👋</h1>
        </header>

        <section aria-labelledby="tools-h">
          <h2 id="tools-h" className="font-display text-xl font-semibold mb-3">My tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TOOLS.map((t) => (
              <Link key={t.href} to={t.href} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors">
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><t.icon className="w-5 h-5 text-primary" /></span>
                <span className="font-medium">{t.title}</span>
              </Link>
            ))}
          </div>
        </section>

        {shares.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Inbox className="w-5 h-5" /> Shared with you</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {shares.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40">
                  <div>
                    <p className="text-sm text-muted-foreground">{nameOf(s.sender_id)} shared a {s.item_type}</p>
                    <Link to={s.item_type === "article" ? `/blog/${s.item_slug}` : `/strains/${s.item_slug}`} className="font-medium text-primary hover:underline">{s.item_title}</Link>
                    {s.note && <p className="text-sm mt-1">“{s.note}”</p>}
                  </div>
                  <Button size="icon" variant="ghost" aria-label="Dismiss" onClick={() => dismissShare(s.id)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-lg">What I love</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="dn">My name (others see this)</Label>
              <Input id="dn" defaultValue={me.display_name} maxLength={40}
                onBlur={(e) => e.target.value.trim() && e.target.value !== me.display_name && save({ display_name: e.target.value.trim() })} />
            </div>
            <div className="space-y-2"><Label>Effects</Label><Chips options={EFFECTS} value={me.liked_effects} onToggle={(v) => toggle("liked_effects", v)} /></div>
            <div className="space-y-2"><Label>Flavours</Label><Chips options={FLAVOURS} value={me.liked_flavours} onToggle={(v) => toggle("liked_flavours", v)} /></div>
            <div className="space-y-2"><Label>Topics I read about</Label><Chips options={TOPICS} value={me.liked_topics} onToggle={(v) => toggle("liked_topics", v)} /></div>
            <div className="space-y-2">
              <Label htmlFor="fs">Favourite strains</Label>
              <div className="flex flex-wrap gap-2">
                {me.favourite_strains.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 py-1">{s}
                    <button aria-label={`Remove ${s}`} onClick={() => save({ favourite_strains: me.favourite_strains.filter((x) => x !== s) })}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={(e) => {
                e.preventDefault();
                const v = strainInput.trim().slice(0, 60);
                if (v && !me.favourite_strains.includes(v) && me.favourite_strains.length < 20) save({ favourite_strains: [...me.favourite_strains, v] });
                setStrainInput("");
              }}>
                <Input id="fs" placeholder="e.g. Durban Poison" value={strainInput} onChange={(e) => setStrainInput(e.target.value)} />
                <Button type="submit" variant="outline">Add</Button>
              </form>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="disc" checked={me.discoverable} onCheckedChange={(v) => save({ discoverable: v })} />
              <Label htmlFor="disc">Let people with the same likes find me (only my name and likes are shown)</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">People who like what you like</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {matches.length === 0 ? (
              <p className="text-muted-foreground text-sm">No matches yet. Pick a few likes above, or invite a friend with your link below.</p>
            ) : matches.map(({ profile, shared }) => (
              <div key={profile.user_id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium">{profile.display_name}</p>
                  <p className="text-sm text-muted-foreground">You both like: {shared.slice(0, 4).join(", ")}</p>
                </div>
                <Button size="sm" onClick={() => invite(profile.user_id)}><UserPlus className="w-4 h-4 mr-1" /> Invite</Button>
              </div>
            ))}
            <div className="pt-3 border-t border-border">
              <Label>Or share your invite link</Label>
              <div className="flex gap-2 mt-2">
                <Input readOnly value={inviteLink} aria-label="Your invite link" />
                <Button variant="outline" onClick={copyLink}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">My friends</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {incoming.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary/5">
                <p><span className="font-medium">{nameOf(c.requester_id)}</span> wants to connect</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respond(c.id, "accepted")}>Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => respond(c.id, "declined")}>Decline</Button>
                </div>
              </div>
            ))}
            {outgoing.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border text-sm">
                <span>Invite sent to {nameOf(c.addressee_id)}</span>
                <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Cancel</Button>
              </div>
            ))}
            {friends.length === 0 && incoming.length === 0 && <p className="text-muted-foreground text-sm">No friends yet.</p>}
            {friends.map((c) => {
              const f = others.find((o) => o.user_id === otherId(c));
              return (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">{f?.display_name ?? "Cuddles friend"}</p>
                    {f && <p className="text-sm text-muted-foreground">Shared likes: {sharedLikes(me, f).slice(0, 4).join(", ") || "—"}</p>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Remove</Button>
                </div>
              );
            })}

            {friends.length > 0 && (
              <div className="pt-4 border-t border-border space-y-3">
                <p className="font-medium">Share something with a friend</p>
                <div className="grid md:grid-cols-3 gap-2">
                  <select aria-label="Friend" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={shareTo} onChange={(e) => setShareTo(e.target.value)}>
                    <option value="">Choose a friend</option>
                    {friends.map((c) => <option key={c.id} value={otherId(c)}>{nameOf(otherId(c))}</option>)}
                  </select>
                  <select aria-label="What to share" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={shareKind} onChange={(e) => { setShareKind(e.target.value as "article" | "strain"); setShareValue(""); }}>
                    <option value="article">An article</option>
                    <option value="strain">A strain</option>
                  </select>
                  {shareKind === "article" ? (
                    <select aria-label="Article" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={shareValue} onChange={(e) => setShareValue(e.target.value)}>
                      <option value="">Choose an article</option>
                      {staticBlogPosts.map((p) => <option key={p.slug} value={p.slug}>{p.title.slice(0, 70)}</option>)}
                    </select>
                  ) : (
                    <Input placeholder="Strain name" value={shareValue} maxLength={60} onChange={(e) => setShareValue(e.target.value)} />
                  )}
                </div>
                <Input placeholder="Add a short note (optional)" maxLength={300} value={shareNote} onChange={(e) => setShareNote(e.target.value)} />
                <Button onClick={sendShare} disabled={!shareTo || !shareValue}><Send className="w-4 h-4 mr-1" /> Share</Button>
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center">Education only — not medical advice. 18+.</p>
      </div>
    </main>
  );
};

export default Dashboard;
