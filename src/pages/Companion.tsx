import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Check, Leaf, MessageCircle, Plus, Send, Square, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEO from "@/components/SEO";
import { askCompanion } from "@/lib/companion";

type Room = { id: string; title: string; owner_id: string; friend_id: string | null };
type Message = { id: string; role: string; sender_id: string | null; content: string; created_at: string };
type Task = { id: string; title: string; due_at: string | null; completed: boolean };

export default function Companion() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [active, setActive] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<{ id: string; name: string }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [working, setWorking] = useState(false);
  const [partial, setPartial] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [friend, setFriend] = useState("personal");
  const [askOpen, setAskOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [due, setDue] = useState("");
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [r, t, c] = await Promise.all([
      supabase.from("companion_rooms").select("id,title,owner_id,friend_id").order("created_at", { ascending: false }),
      supabase.from("companion_tasks").select("id,title,due_at,completed").order("created_at", { ascending: false }),
      supabase.from("connections").select("requester_id,addressee_id").eq("status", "accepted"),
    ]);
    if (r.error || t.error || c.error) { setError("Your conversations couldn't load. Please try again."); setLoading(false); return; }
    setRooms(r.data ?? []); setTasks(t.data ?? []);
    const ids = (c.data ?? []).map((row) => row.requester_id === user.id ? row.addressee_id : row.requester_id);
    if (ids.length) {
      const p = await supabase.from("profiles").select("user_id,display_name").in("user_id", ids);
      setFriends(ids.map((id) => ({ id, name: p.data?.find((x) => x.user_id === id)?.display_name || "Cuddles friend" })));
    } else setFriends([]);
    setLoading(false);
  }, [user]);
  const loadMessages = useCallback(async () => {
    if (!active) return;
    const room = await supabase.from("companion_rooms").select("id").eq("id", active.id).maybeSingle();
    if (!room.data) { setActive(null); setMessages([]); setError("This conversation is no longer available."); await load(); return; }
    const result = await supabase.from("companion_messages").select("id,role,sender_id,content,created_at").eq("room_id", active.id).order("created_at").order("id");
    if (result.error) setError("Messages couldn't load. Please try again.");
    else setMessages(result.data ?? []);
  }, [active, load]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    setMessages([]); setPartial(""); setError(""); void loadMessages();
    const timer = window.setInterval(() => { void loadMessages(); }, 5000);
    return () => { window.clearInterval(timer); abort.current?.abort(); };
  }, [loadMessages]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "instant", block: "nearest" }); }, [messages, partial]);

  const create = async () => {
    if (!user || !title.trim()) return;
    setSending(true); setError("");
    const result = await supabase.from("companion_rooms").insert({ owner_id: user.id, friend_id: friend === "personal" ? null : friend, title: title.trim() }).select("id,title,owner_id,friend_id").maybeSingle();
    setSending(false);
    if (result.error || !result.data) { setError("Conversation not created. Check you are still connected to this friend."); return; }
    setActive(result.data); setCreateOpen(false); setTitle(""); await load();
  };
  const send = async () => {
    if (!user || !active || !draft.trim()) return;
    setSending(true); setError("");
    const { error: failure } = await supabase.from("companion_messages").insert({ room_id: active.id, sender_id: user.id, role: "user", content: draft.trim() });
    setSending(false);
    if (failure) setError("Message not sent. Please check your connection and try again.");
    else { setDraft(""); await loadMessages(); }
  };
  const ask = async () => {
    if (!active) return;
    setAskOpen(false); setWorking(true); setPartial(""); setError("");
    const controller = new AbortController(); abort.current = controller;
    try { await askCompanion(active.id, setPartial, controller.signal); await loadMessages(); }
    catch (e) { setError(controller.signal.aborted ? "Stopped. Any unfinished reply was not saved." : e instanceof Error ? e.message : "Cuddles is unavailable."); }
    finally { setWorking(false); setPartial(""); abort.current = null; }
  };
  const saveTask = async () => {
    if (!user || !taskTitle.trim()) return;
    setSending(true);
    const { error: failure } = await supabase.from("companion_tasks").insert({ user_id: user.id, title: taskTitle.trim(), due_at: due ? new Date(due).toISOString() : null });
    setSending(false);
    if (failure) setError("Task couldn't be saved. Please try again.");
    else { setTaskOpen(false); setTaskTitle(""); setDue(""); await load(); }
  };
  const updateTask = async (task: Task, remove = false) => {
    const result = remove ? await supabase.from("companion_tasks").delete().eq("id", task.id) : await supabase.from("companion_tasks").update({ completed: !task.completed }).eq("id", task.id);
    if (result.error) setError("Task couldn't be updated."); else await load();
  };
  const deleteRoom = async () => {
    if (!active || !window.confirm("Delete this conversation and its messages?")) return;
    const { error: failure } = await supabase.from("companion_rooms").delete().eq("id", active.id);
    if (failure) setError("Conversation couldn't be deleted."); else { setActive(null); setMessages([]); await load(); }
  };

  return <main className="min-h-screen bg-background pt-24 pb-16">
    <SEO title="My Cuddles Companion | Cuddles AI" description="Your private Cuddles conversations and conversations with friends." url="/companion" noindex />
    <div className="container max-w-5xl mx-auto px-4">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground mb-5"><ArrowLeft className="w-4 h-4" /> My dashboard</Link>
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div><h1 className="font-display text-3xl font-bold">My Cuddles companion</h1><p className="text-muted-foreground mt-2">A little help. A conversation together.</p></div>
        <Button onClick={() => { setFriend("personal"); setCreateOpen(true); }}><Plus className="w-4 h-4 mr-2" /> New conversation</Button>
      </header>
      {error && <div role="alert" className="border border-destructive rounded-lg p-4 mb-4 text-foreground">{error}<Button variant="ghost" size="sm" onClick={() => { setError(""); void load(); void loadMessages(); }}>Try again</Button></div>}
      <div className="grid md:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <aside aria-label="Conversations" className="border-b md:border-b-0 md:border-r border-border pb-4 md:pr-5 space-y-2">
          <h2 className="font-display font-semibold mb-3">Conversations</h2>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : rooms.length === 0 ? <p className="text-sm text-muted-foreground">No conversations yet.</p> : rooms.map((room) => <Button key={room.id} variant={active?.id === room.id ? "secondary" : "ghost"} className="w-full justify-start h-auto min-h-12 whitespace-normal text-left gap-2" disabled={working || sending} onClick={() => setActive(room)}>{room.friend_id ? <Users className="w-4 h-4 shrink-0" /> : <Leaf className="w-4 h-4 shrink-0" />}<span className="break-words min-w-0">{room.title}</span></Button>)}
        </aside>
        <section className="min-w-0" aria-label="Current conversation">
          {active ? <>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
              <div className="min-w-0"><h2 className="font-display text-xl font-semibold break-words">{active.title}</h2><p className="text-sm text-muted-foreground">{active.friend_id ? `Shared with ${friends.find((f) => f.id === (active.owner_id === user?.id ? active.friend_id : active.owner_id))?.name || "your friend"}` : "Just you and Cuddles"}</p></div>
              {active.owner_id === user?.id && <Button variant="ghost" size="icon" aria-label="Delete conversation" disabled={working} onClick={deleteRoom}><Trash2 className="w-4 h-4" /></Button>}
            </div>
            <div className="h-[420px] overflow-y-auto py-5 space-y-5" role="log" aria-label="Messages">
              {messages.length === 0 && <p className="text-muted-foreground">What would you like help with today?</p>}
              {messages.map((m) => <article key={m.id} className="space-y-1 break-words">
                <p className="text-sm font-semibold text-primary">{m.role === "assistant" ? "Cuddles" : m.sender_id === user?.id ? "You" : "Your friend"}</p>
                <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                {m.role === "assistant" && <Button variant="ghost" size="sm" onClick={() => { setTaskTitle(""); setDue(""); setTaskOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Save a private task</Button>}
              </article>)}
              {working && <article aria-live="polite"><p className="text-primary font-semibold mb-1">Cuddles</p><div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{partial || "Thinking…"}</ReactMarkdown></div></article>}
              <div ref={bottom} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="space-y-3 border-t border-border pt-4">
              <Label htmlFor="companion-message">Your message</Label>
              <Textarea id="companion-message" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={4500} placeholder="Tell us what’s on your mind…" disabled={working || sending} className="min-h-24" />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={!draft.trim() || sending || working}><Send className="w-4 h-4 mr-2" />{sending ? "Sending…" : "Send"}</Button>
                {working ? <Button type="button" variant="outline" onClick={() => abort.current?.abort()}><Square className="w-4 h-4 mr-2" /> Stop</Button> : <Button type="button" variant="outline" disabled={!messages.length || sending} onClick={() => setAskOpen(true)}><Leaf className="w-4 h-4 mr-2" /> Ask Cuddles</Button>}
              </div>
            </form>
          </> : <div className="min-h-80 flex flex-col items-center justify-center gap-4 text-center"><MessageCircle className="w-10 h-10 text-primary" /><h2 className="font-display text-xl">Make room for a conversation</h2><Button variant="outline" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" /> Start a conversation</Button></div>}
        </section>
      </div>
      <section className="border-t border-border mt-10 pt-6" aria-labelledby="private-tasks-heading">
        <div className="flex items-center justify-between gap-3 mb-4"><h2 id="private-tasks-heading" className="font-display text-xl font-semibold">My private tasks</h2><Button variant="outline" size="sm" onClick={() => { setTaskTitle(""); setDue(""); setTaskOpen(true); }}><Plus className="w-4 h-4 mr-1" /> Add task</Button></div>
        {!tasks.length && <p className="text-muted-foreground text-sm">No tasks saved yet.</p>}
        <div className="space-y-2">{tasks.map((task) => <div key={task.id} className="flex items-center gap-3 border-b border-border py-3">
          <Button variant={task.completed ? "secondary" : "outline"} size="icon" aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`} onClick={() => updateTask(task)}><Check className="w-4 h-4" /></Button>
          <div className="flex-1 min-w-0"><p className={`break-words ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>{task.due_at && <p className="text-sm text-muted-foreground">{new Date(task.due_at).toLocaleString()}</p>}</div>
          <Button variant="ghost" size="icon" aria-label={`Delete task ${task.title}`} onClick={() => updateTask(task, true)}><Trash2 className="w-4 h-4" /></Button>
        </div>)}</div>
      </section>
      <p className="text-xs text-muted-foreground mt-8">Education only — not medical advice. 18+.</p>
    </div>
    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><DialogHeader><DialogTitle>New conversation</DialogTitle><DialogDescription>Choose a private conversation or an accepted friend.</DialogDescription></DialogHeader>
      <Label htmlFor="conversation-title">Name</Label><Input id="conversation-title" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My plant care plan" />
      <Label>Who’s here?</Label><Select value={friend} onValueChange={setFriend}><SelectTrigger aria-label="Conversation participants"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="personal">Just me and Cuddles</SelectItem>{friends.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select>
      <Button disabled={!title.trim() || sending} onClick={create}>{sending ? "Creating…" : "Create conversation"}</Button>
    </DialogContent></Dialog>
    <Dialog open={askOpen} onOpenChange={setAskOpen}><DialogContent><DialogHeader><DialogTitle>Ask Cuddles to join?</DialogTitle><DialogDescription>{active?.friend_id ? "Cuddles will read this shared conversation. Your private journals and grow records stay private. The reply will be visible to both of you." : "Cuddles can use this conversation and your own saved history to help you. Tasks are only saved after you approve them."}</DialogDescription></DialogHeader><Button onClick={ask}><Leaf className="w-4 h-4 mr-2" /> Ask Cuddles now</Button></DialogContent></Dialog>
    <Dialog open={taskOpen} onOpenChange={setTaskOpen}><DialogContent><DialogHeader><DialogTitle>Save a private task</DialogTitle><DialogDescription>Only you can see this task. A due date does not send a phone alert.</DialogDescription></DialogHeader><Label htmlFor="private-task">Task</Label><Textarea id="private-task" maxLength={300} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Check the soil before watering" /><Label htmlFor="task-due">Due date (optional)</Label><Input id="task-due" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} /><Button disabled={!taskTitle.trim() || sending} onClick={saveTask}>{sending ? "Saving…" : "Approve and save privately"}</Button></DialogContent></Dialog>
  </main>;
}