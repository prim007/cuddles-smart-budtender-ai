import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, BookOpen, Smile, Frown, Meh, Star, Calendar, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import PremiumInsightCard from "@/components/PremiumInsightCard";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  strain_name: string;
  strain_type: string | null;
  consumption_method: string | null;
  dosage: string | null;
  mood_before: number | null;
  mood_after: number | null;
  effects: string[];
  rating: number | null;
  notes: string | null;
  session_date: string;
  created_at: string;
}

const EFFECTS_OPTIONS = [
  "Relaxed", "Euphoric", "Happy", "Creative", "Focused", "Energetic",
  "Sleepy", "Hungry", "Uplifted", "Talkative", "Giggly", "Tingly",
  "Pain Relief", "Stress Relief", "Anxiety Relief"
];

const StrainJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    strain_name: "",
    strain_type: "hybrid",
    consumption_method: "smoke",
    dosage: "",
    mood_before: 3,
    mood_after: 3,
    rating: 3,
    notes: "",
  });

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("strain_journal")
        .select("*")
        .order("session_date", { ascending: false });

      if (error) throw error;
      setEntries((data || []).map(e => ({ ...e, effects: Array.isArray(e.effects) ? (e.effects as string[]) : [] })));
    } catch (error) {
      console.error("Error fetching journal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to log entries.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("strain_journal").insert({
        user_id: user.id,
        strain_name: formData.strain_name.trim(),
        strain_type: formData.strain_type,
        consumption_method: formData.consumption_method,
        dosage: formData.dosage.trim() || null,
        mood_before: formData.mood_before,
        mood_after: formData.mood_after,
        effects: selectedEffects,
        rating: formData.rating,
        notes: formData.notes.trim() || null,
      });

      if (error) throw error;

      toast({ title: "Entry logged! 🌿", description: "Your session has been recorded." });
      setIsDialogOpen(false);
      setFormData({ strain_name: "", strain_type: "hybrid", consumption_method: "smoke", dosage: "", mood_before: 3, mood_after: 3, rating: 3, notes: "" });
      setSelectedEffects([]);
      fetchEntries();
    } catch (error) {
      toast({ title: "Error", description: "Failed to log entry. Please try again.", variant: "destructive" });
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from("strain_journal").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Entry deleted" });
      fetchEntries();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
    }
  };

  const getMoodIcon = (mood: number | null) => {
    if (!mood) return <Meh className="w-4 h-4" />;
    if (mood >= 4) return <Smile className="w-4 h-4 text-hippie-green" />;
    if (mood <= 2) return <Frown className="w-4 h-4 text-hippie-orange" />;
    return <Meh className="w-4 h-4 text-hippie-yellow" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-hippie-purple" />
            <h2 className="text-xl font-display font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Create an account to start your strain journal.</p>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-hippie-purple to-hippie-pink">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title="Strain Journal — Track Your Cannabis Sessions"
        description="Log every cannabis session — strain, dose, mood, and effects. Spot patterns over time with Cuddles AI's private strain journal."
        url="/journal"
        keywords="cannabis journal, strain tracker, weed diary, dosage log, mood tracking, cannabis effects journal"
      />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-hippie-pink/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-hippie-purple to-hippie-pink">
                <Plus className="w-4 h-4 mr-2" />Log Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display font-bold text-xl">Log Cannabis Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Strain Name *</Label>
                  <Input value={formData.strain_name} onChange={e => setFormData(p => ({ ...p, strain_name: e.target.value }))} required placeholder="e.g., Blue Dream" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.strain_type} onValueChange={v => setFormData(p => ({ ...p, strain_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indica">Indica</SelectItem>
                        <SelectItem value="sativa">Sativa</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Method</Label>
                    <Select value={formData.consumption_method} onValueChange={v => setFormData(p => ({ ...p, consumption_method: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smoke">Smoke</SelectItem>
                        <SelectItem value="vape">Vape</SelectItem>
                        <SelectItem value="edible">Edible</SelectItem>
                        <SelectItem value="tincture">Tincture</SelectItem>
                        <SelectItem value="topical">Topical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input value={formData.dosage} onChange={e => setFormData(p => ({ ...p, dosage: e.target.value }))} placeholder="e.g., 2 hits, 10mg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mood Before (1-5)</Label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Button key={n} type="button" size="sm" variant={formData.mood_before === n ? "default" : "outline"} onClick={() => setFormData(p => ({ ...p, mood_before: n }))}>{n}</Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Mood After (1-5)</Label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Button key={n} type="button" size="sm" variant={formData.mood_after === n ? "default" : "outline"} onClick={() => setFormData(p => ({ ...p, mood_after: n }))}>{n}</Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Effects</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EFFECTS_OPTIONS.map(effect => (
                      <Badge key={effect} variant={selectedEffects.includes(effect) ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedEffects(p => p.includes(effect) ? p.filter(e => e !== effect) : [...p, effect])}>{effect}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Rating</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Button key={n} type="button" size="sm" variant="ghost" onClick={() => setFormData(p => ({ ...p, rating: n }))}>
                        <Star className={`w-5 h-5 ${n <= formData.rating ? "fill-hippie-yellow text-hippie-yellow" : "text-muted-foreground"}`} />
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="How was the experience?" rows={3} />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-hippie-purple to-hippie-pink">Save Entry</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <section className="pt-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-6 bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange bg-clip-text text-transparent">
            Strain Journal 📓
          </h1>
          <div className="mb-6"><PremiumInsightCard kind="journal" /></div>

          {loading ? (
            <div className="text-center py-8">Loading your journal...</div>
          ) : entries.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No entries yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your cannabis experiences!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {entry.strain_name}
                          <Badge variant="outline" className="text-xs">{entry.strain_type}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(entry.session_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} className={`w-4 h-4 ${n <= (entry.rating || 0) ? "fill-hippie-yellow text-hippie-yellow" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm mb-3">
                      <span className="flex items-center gap-1">Method: <Badge variant="secondary">{entry.consumption_method}</Badge></span>
                      {entry.dosage && <span>Dosage: {entry.dosage}</span>}
                      <span className="flex items-center gap-1">Mood: {getMoodIcon(entry.mood_before)} → {getMoodIcon(entry.mood_after)}</span>
                    </div>
                    {entry.effects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.effects.map(effect => (
                          <Badge key={effect} variant="outline" className="text-xs">{effect}</Badge>
                        ))}
                      </div>
                    )}
                    {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StrainJournal;
