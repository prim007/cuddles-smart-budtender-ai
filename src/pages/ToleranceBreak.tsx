import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Target, Trophy, Sparkles, Heart, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format, addDays } from "date-fns";

interface DailyLog {
  day: number;
  mood: number;
  sleep?: number;
  cravings?: number;
  energy?: number;
  appetite?: number;
  triggers?: string[];
  symptoms: string;
  date: string;
}

interface ToleranceBreak {
  id: string;
  start_date: string;
  target_days: number;
  end_date: string | null;
  status: string;
  reason: string | null;
  daily_logs: DailyLog[];
  motivation_notes: string[] | null;
  created_at: string;
}

const TRIGGER_OPTIONS = ["Stress", "Boredom", "Social", "Sleep", "Pain", "Habit", "Anxiety", "Celebration"];
const MILESTONE_DAYS = [3, 7, 14, 21, 30];
const REWARD_CODE = "TBREAK15";

const ToleranceBreak = () => {
  const [breaks, setBreaks] = useState<ToleranceBreak[]>([]);
  const [activeBreak, setActiveBreak] = useState<ToleranceBreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [coachMessage, setCoachMessage] = useState("");
  const [isCoaching, setIsCoaching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    target_days: 7,
    reason: "",
  });

  const [checkinData, setCheckinData] = useState({
    mood: 3,
    sleep: 3,
    cravings: 3,
    energy: 3,
    appetite: 3,
    triggers: [] as string[],
    symptoms: "",
  });


  useEffect(() => {
    if (user) fetchBreaks();
  }, [user]);

  const fetchBreaks = async () => {
    try {
      const { data, error } = await supabase
        .from("tolerance_breaks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processed: ToleranceBreak[] = (data || []).map(b => ({
        ...b,
        daily_logs: Array.isArray(b.daily_logs) ? (b.daily_logs as Array<{ day: number; mood: number; symptoms: string; date: string }>) : []
      }));

      setBreaks(processed);
      setActiveBreak(processed.find(b => b.status === "active") || null);
    } catch (error) {
      console.error("Error fetching breaks:", error);
    } finally {
      setLoading(false);
    }
  };

  const startBreak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase.from("tolerance_breaks").insert({
        user_id: user.id,
        target_days: formData.target_days,
        reason: formData.reason.trim() || null,
      }).select().single();

      if (error) throw error;

      // Get coaching message
      await getCoachingMessage("start", 1, formData.target_days, undefined, undefined, formData.reason);

      toast({ title: "T-Break started! 💪", description: "You got this! Cuddles is here to support you." });
      setIsDialogOpen(false);
      setFormData({ target_days: 7, reason: "" });
      fetchBreaks();
    } catch (error) {
      toast({ title: "Error", description: "Failed to start break. Please try again.", variant: "destructive" });
    }
  };

  const notifyMilestone = async (
    brk: ToleranceBreak,
    dayNumber: number,
    completed: boolean
  ) => {
    if (!user?.email) return;
    const key = completed ? "notified:completed" : `notified:day${dayNumber}`;
    const notes = brk.motivation_notes || [];
    if (notes.includes(key)) return;

    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "t-break-milestone",
          recipientEmail: user.email,
          idempotencyKey: `tbreak-${brk.id}-${key}`,
          templateData: {
            milestone: completed ? "the finish line" : `day ${dayNumber}`,
            dayNumber,
            targetDays: brk.target_days,
            completed,
            ...(completed ? { rewardCode: REWARD_CODE } : {}),
            appUrl: `${window.location.origin}/t-break`,
          },
        },
      });

      await supabase
        .from("tolerance_breaks")
        .update({ motivation_notes: [...notes, key] })
        .eq("id", brk.id);
    } catch (err) {
      console.error("Milestone notification failed:", err);
    }
  };

  const dailyCheckin = async () => {
    if (!activeBreak) return;

    const dayNumber = differenceInDays(new Date(), new Date(activeBreak.start_date)) + 1;

    try {
      const newLog: DailyLog = {
        day: dayNumber,
        mood: checkinData.mood,
        sleep: checkinData.sleep,
        cravings: checkinData.cravings,
        energy: checkinData.energy,
        appetite: checkinData.appetite,
        triggers: checkinData.triggers,
        symptoms: checkinData.symptoms,
        date: new Date().toISOString(),
      };

      const updatedLogs = [...activeBreak.daily_logs, newLog];

      const { error } = await supabase
        .from("tolerance_breaks")
        .update({ daily_logs: updatedLogs as unknown as never })
        .eq("id", activeBreak.id);

      if (error) throw error;

      // Milestone email (day 3/7/14/21/30, only within the target)
      if (MILESTONE_DAYS.includes(dayNumber) && dayNumber < activeBreak.target_days) {
        await notifyMilestone(activeBreak, dayNumber, false);
      }

      // Get coaching message
      await getCoachingMessage("daily_checkin", dayNumber, activeBreak.target_days, checkinData.mood, checkinData.symptoms);

      toast({ title: "Check-in recorded! 📝" });
      setIsCheckinOpen(false);
      setCheckinData({ mood: 3, sleep: 3, cravings: 3, energy: 3, appetite: 3, triggers: [], symptoms: "" });
      fetchBreaks();
    } catch (error) {
      toast({ title: "Error", description: "Failed to record check-in.", variant: "destructive" });
    }
  };

  const completeBreak = async () => {
    if (!activeBreak) return;

    try {
      const { error } = await supabase
        .from("tolerance_breaks")
        .update({ status: "completed", end_date: new Date().toISOString() })
        .eq("id", activeBreak.id);

      if (error) throw error;

      await notifyMilestone(activeBreak, activeBreak.target_days, true);
      await getCoachingMessage("completed", activeBreak.target_days, activeBreak.target_days);

      toast({
        title: "Congratulations! 🎉",
        description: `You completed your tolerance break — reward code ${REWARD_CODE} is on its way to your inbox.`,
      });
      fetchBreaks();
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete break.", variant: "destructive" });
    }
  };


  const cancelBreak = async () => {
    if (!activeBreak) return;

    try {
      const { error } = await supabase
        .from("tolerance_breaks")
        .update({ status: "cancelled", end_date: new Date().toISOString() })
        .eq("id", activeBreak.id);

      if (error) throw error;

      toast({ title: "Break ended", description: "No worries, you can always try again!" });
      setCoachMessage("");
      fetchBreaks();
    } catch (error) {
      toast({ title: "Error", description: "Failed to end break.", variant: "destructive" });
    }
  };

  const getCoachingMessage = async (
    action: string,
    dayNumber: number,
    targetDays: number,
    mood?: number,
    symptoms?: string,
    reason?: string
  ) => {
    setIsCoaching(true);
    try {
      const { data, error } = await supabase.functions.invoke("tolerance-coach", {
        body: { action, dayNumber, targetDays, mood, symptoms, reason },
      });

      if (error) throw error;
      setCoachMessage(data.message || "Keep going! You're doing great!");
    } catch (error) {
      console.error("Error getting coaching:", error);
      setCoachMessage("Keep pushing through! Every day counts. 💪");
    } finally {
      setIsCoaching(false);
    }
  };

  const getMotivation = async () => {
    if (!activeBreak) return;
    const dayNumber = differenceInDays(new Date(), new Date(activeBreak.start_date)) + 1;
    await getCoachingMessage("motivation", dayNumber, activeBreak.target_days);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-hippie-purple" />
            <h2 className="text-xl font-display font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Create an account to track your tolerance breaks.</p>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-hippie-purple to-hippie-pink">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysPassed = activeBreak ? differenceInDays(new Date(), new Date(activeBreak.start_date)) + 1 : 0;
  const progress = activeBreak ? Math.min((daysPassed / activeBreak.target_days) * 100, 100) : 0;
  const isComplete = activeBreak && daysPassed >= activeBreak.target_days;

  return (
    <div className="min-h-screen pb-20">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-hippie-pink/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          </Link>
          {!activeBreak && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-hippie-purple to-hippie-pink">
                  <Plus className="w-4 h-4 mr-2" />Start T-Break
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display font-bold text-xl">Start Your Tolerance Break</DialogTitle>
                </DialogHeader>
                <form onSubmit={startBreak} className="space-y-4">
                  <div>
                    <Label>How many days?</Label>
                    <div className="flex gap-2 mt-2">
                      {[3, 7, 14, 21, 30].map(days => (
                        <Button key={days} type="button" variant={formData.target_days === days ? "default" : "outline"} onClick={() => setFormData(p => ({ ...p, target_days: days }))}>{days}</Button>
                      ))}
                    </div>
                    <Input type="number" min={1} max={365} value={formData.target_days} onChange={e => setFormData(p => ({ ...p, target_days: parseInt(e.target.value) || 7 }))} className="mt-2" />
                  </div>
                  <div>
                    <Label>Why are you taking this break? (optional)</Label>
                    <Textarea value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} placeholder="e.g., Reset my tolerance, save money, clearer mind..." rows={3} />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-hippie-purple to-hippie-pink">Start My Break</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </nav>

      <section className="pt-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-6 bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange bg-clip-text text-transparent text-center">
            Tolerance Break Coach 🧘
          </h1>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : activeBreak ? (
            <div className="space-y-6">
              {/* Progress Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-hippie-purple/10 to-hippie-pink/10">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Your T-Break Progress
                    </CardTitle>
                    <Badge variant={isComplete ? "default" : "outline"}>
                      {isComplete ? "Ready to Complete!" : `Day ${daysPassed} of ${activeBreak.target_days}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-4" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-hippie-purple" />
                      <div className="text-2xl font-bold">{daysPassed}</div>
                      <div className="text-xs text-muted-foreground">Days Clean</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <Target className="w-6 h-6 mx-auto mb-2 text-hippie-pink" />
                      <div className="text-2xl font-bold">{activeBreak.target_days - daysPassed > 0 ? activeBreak.target_days - daysPassed : 0}</div>
                      <div className="text-xs text-muted-foreground">Days Left</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <Trophy className="w-6 h-6 mx-auto mb-2 text-hippie-yellow" />
                      <div className="text-2xl font-bold">{activeBreak.daily_logs.length}</div>
                      <div className="text-xs text-muted-foreground">Check-ins</div>
                    </div>
                  </div>

                  {activeBreak.reason && (
                    <div className="p-4 rounded-lg bg-hippie-green/10 border border-hippie-green/30">
                      <p className="text-sm"><strong>Your Why:</strong> {activeBreak.reason}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Dialog open={isCheckinOpen} onOpenChange={setIsCheckinOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-gradient-to-r from-hippie-purple to-hippie-pink">
                          <CheckCircle className="w-4 h-4 mr-2" />Daily Check-in
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Day {daysPassed} Check-in</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>How are you feeling? (1-5)</Label>
                            <div className="flex gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Button key={n} variant={checkinData.mood === n ? "default" : "outline"} onClick={() => setCheckinData(p => ({ ...p, mood: n }))} className="flex-1">
                                  {n === 1 ? "😔" : n === 2 ? "😕" : n === 3 ? "😐" : n === 4 ? "🙂" : "😄"}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Any symptoms or thoughts?</Label>
                            <Textarea value={checkinData.symptoms} onChange={e => setCheckinData(p => ({ ...p, symptoms: e.target.value }))} placeholder="e.g., Trouble sleeping, feeling irritable, cravings..." rows={3} />
                          </div>
                          <Button onClick={dailyCheckin} className="w-full">Save Check-in</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={getMotivation} disabled={isCoaching}>
                      {isCoaching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Get Motivation
                    </Button>

                    {isComplete ? (
                      <Button onClick={completeBreak} className="bg-hippie-green hover:bg-hippie-green/90">
                        <Trophy className="w-4 h-4 mr-2" />Complete Break!
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={cancelBreak} className="text-destructive">
                        <XCircle className="w-4 h-4 mr-2" />End Early
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Coach Message */}
              {(coachMessage || isCoaching) && (
                <Card className="bg-gradient-to-r from-hippie-purple/5 to-hippie-pink/5 border-hippie-purple/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-hippie-purple to-hippie-pink flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">Cuddles Coach</p>
                        {isCoaching ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Thinking...
                          </div>
                        ) : (
                          <p className="text-muted-foreground">{coachMessage}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Check-in History */}
              {activeBreak.daily_logs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Check-in History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {activeBreak.daily_logs.slice().reverse().map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                          <span className="text-sm font-medium">Day {log.day}</span>
                          <span>{["😔", "😕", "😐", "🙂", "😄"][log.mood - 1]}</span>
                          {log.symptoms && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{log.symptoms}</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* No Active Break */
            <Card className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-hippie-purple" />
              <h3 className="text-xl font-display font-bold mb-2">Ready for a Reset?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                A tolerance break can help you enjoy cannabis more while saving money. Cuddles will be your personal coach through the journey!
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-hippie-purple to-hippie-pink">
                <Plus className="w-4 h-4 mr-2" />Start Your T-Break
              </Button>
            </Card>
          )}

          {/* Past Breaks */}
          {breaks.filter(b => b.status !== "active").length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-sm">Past Breaks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {breaks.filter(b => b.status !== "active").slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <span className="font-medium">{b.target_days}-day break</span>
                      <p className="text-xs text-muted-foreground">Started {format(new Date(b.start_date), "MMM d, yyyy")}</p>
                    </div>
                    <Badge variant={b.status === "completed" ? "default" : "secondary"}>
                      {b.status === "completed" ? "✓ Completed" : "Ended early"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default ToleranceBreak;
