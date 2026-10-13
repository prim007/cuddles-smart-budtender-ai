import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { streamImage } from "@/lib/streamImage";
import { downloadImage } from "@/lib/downloadImage";
import { useAuth } from "@/hooks/useAuth";
import cuddles from "@/assets/cuddles.png";

export default function ImageStudio() {
  const { user } = useAuth();
  const [mode, setMode] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Illustration");
  const [size, setSize] = useState("1024x1024");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [image, setImage] = useState("");
  const [final, setFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const generate = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !user) return;
    setBusy(true); setError(""); setImage(""); setFinal(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again to create an image.");
      await streamImage(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-cannabis-image`,
        { prompt, mode, style, size, topText, bottomText },
        (url, complete) => { setImage(url); setFinal(complete); }, undefined,
        { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY });
    } catch (e) { setError(e instanceof Error ? e.message : "Image creation failed."); setImage(""); setFinal(false); }
    finally { setBusy(false); }
  };
  const download = () => {
    if (!image || !final || busy) return;
    try { downloadImage(image, `cuddles-${mode}-${Date.now()}.png`); }
    catch (e) { setError(e instanceof Error ? e.message : "This image could not be saved."); }
  };
  return <main className="min-h-screen bg-background px-5 pb-28 pt-28 text-foreground">
    <SEO title="Image Studio | Cuddles AI" description="Create original cannabis-themed images and memes from your own descriptions with Cuddles AI." url="/image-studio" />
    <div className="mx-auto max-w-6xl">
      <Link to="/dashboard" className="text-sm text-primary">My Cuddles</Link>
      <header className="mb-8 mt-3"><h1 className="font-display text-3xl md:text-4xl">Cuddles Image Studio</h1></header>
      <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={generate} className="min-w-0 space-y-6">
          <Tabs value={mode} onValueChange={setMode}><TabsList className="grid h-12 w-full grid-cols-2"><TabsTrigger value="image" disabled={busy}>Image</TabsTrigger><TabsTrigger value="meme" disabled={busy}>Meme</TabsTrigger></TabsList></Tabs>
          <div className="space-y-2"><Label htmlFor="image-prompt">Describe your {mode}</Label><Textarea id="image-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} disabled={busy} required minLength={3} maxLength={2000} className="min-h-36 text-base" placeholder="A cheerful cannabis leaf tending a tiny garden, warm sunset colours…" /></div>
          {mode === "meme" && <div className="space-y-4"><div className="space-y-2"><Label htmlFor="top-caption">Top caption</Label><Input id="top-caption" maxLength={120} value={topText} onChange={e => setTopText(e.target.value)} disabled={busy} placeholder="When you finally grow your first plant" /></div><div className="space-y-2"><Label htmlFor="bottom-caption">Bottom caption</Label><Input id="bottom-caption" maxLength={120} value={bottomText} onChange={e => setBottomText(e.target.value)} disabled={busy} placeholder="Proud plant parent energy" /></div></div>}
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="image-style">Style</Label><Select value={style} onValueChange={setStyle} disabled={busy}><SelectTrigger id="image-style" className="h-12"><SelectValue /></SelectTrigger><SelectContent>{["Illustration", "Cartoon", "Photographic", "Poster"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="image-size">Shape</Label><Select value={size} onValueChange={setSize} disabled={busy}><SelectTrigger id="image-size" className="h-12"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1024x1024">Square</SelectItem><SelectItem value="1536x1024">Landscape</SelectItem><SelectItem value="1024x1536">Portrait</SelectItem></SelectContent></Select></div></div>
          {user ? <Button type="submit" size="lg" disabled={busy || prompt.trim().length < 3} className="h-12 w-full">{busy ? <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <Sparkles className="h-5 w-5" />}{busy ? "Creating…" : `Create ${mode}`}</Button> : <Button asChild size="lg" className="h-12 w-full"><Link to="/auth?next=/image-studio">Sign in to create</Link></Button>}
          {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
          <p className="text-xs leading-5 text-muted-foreground">18+ creative artwork. AI-generated, not medical advice. Descriptions are sent for image creation. <Link to="/privacy-policy" className="underline">Privacy</Link></p>
        </form>
        <section aria-label="Created image" className="min-w-0">
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
            {image ? <img src={image} alt={prompt} className={`h-full w-full object-contain ${final ? "" : "blur-xl"}`} /> : <div className="flex flex-col items-center gap-3 p-8 text-center"><img src={cuddles} alt="Cuddles leaf mascot" width={768} height={768} className="h-48 w-48 object-contain" /><ImagePlus className="h-6 w-6 text-primary" /></div>}
            {busy && <div role="status" className="absolute bottom-5 flex items-center gap-2 rounded-lg bg-background/95 px-4 py-3 text-sm"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />Creating your {mode}…</div>}
          </div>
          <div className="mt-4 flex justify-end"><Button variant="outline" onClick={download} disabled={!final || busy} className="h-12"><Download className="h-4 w-4" />Download PNG</Button></div>
        </section>
      </div>
    </div>
  </main>;
}