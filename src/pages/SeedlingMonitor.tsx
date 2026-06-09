import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import SEO from "@/components/SEO";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Sprout,
  Droplets,
  Sun,
  Thermometer,
  Plus,
  Trash2,
  Sparkles,
  Leaf,
  FlaskConical,
  Scissors,
  ArrowRightLeft,
  StickyNote,
  Loader2,
  Settings as SettingsIcon,
  Bell,
  Ruler,
} from "lucide-react";

const GROWTH_STAGES = [
  { value: "seedling", label: "🌱 Seedling", progress: 15 },
  { value: "vegetative", label: "🌿 Vegetative", progress: 40 },
  { value: "pre-flower", label: "🌼 Pre-Flower", progress: 60 },
  { value: "flowering", label: "🌸 Flowering", progress: 80 },
  { value: "harvest", label: "🌾 Harvest", progress: 100 },
];

type TempUnit = "F" | "C";

interface GlobalSettings {
  tempUnit: TempUnit;
  notificationsEnabled: boolean;
  weeklySummary: boolean;
  aiAutoTips: boolean;
}

interface PlantSettings {
  growEnvironment: "indoor" | "outdoor" | "greenhouse";
  growMedium: "soil" | "coco" | "hydro" | "aero";
  potSize: string; // gallons
  lightType: "LED" | "HPS" | "CFL" | "Sun" | "Mixed";
  lightSchedule: "18/6" | "20/4" | "12/12" | "24/0" | "Natural";
  waterIntervalDays: number;
  feedIntervalDays: number;
  targetTempMin: number; // stored in °F
  targetTempMax: number;
  targetHumidityMin: number;
  targetHumidityMax: number;
  targetPhMin: number;
  targetPhMax: number;
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  tempUnit: "F",
  notificationsEnabled: true,
  weeklySummary: false,
  aiAutoTips: false,
};

const DEFAULT_PLANT_SETTINGS: PlantSettings = {
  growEnvironment: "indoor",
  growMedium: "soil",
  potSize: "5",
  lightType: "LED",
  lightSchedule: "18/6",
  waterIntervalDays: 3,
  feedIntervalDays: 7,
  targetTempMin: 68,
  targetTempMax: 80,
  targetHumidityMin: 40,
  targetHumidityMax: 65,
  targetPhMin: 6.0,
  targetPhMax: 6.8,
};

const GLOBAL_SETTINGS_KEY = "cuddles-grow-global-settings";
const plantSettingsKey = (id: string) => `cuddles-grow-plant-settings-${id}`;

const toDisplayTemp = (f: number | null | undefined, unit: TempUnit) => {
  if (f == null) return null;
  return unit === "C" ? Math.round(((f - 32) * 5) / 9 * 10) / 10 : f;
};
const fromInputTemp = (val: number, unit: TempUnit) =>
  unit === "C" ? (val * 9) / 5 + 32 : val;

const LOG_TYPES = [
  { value: "water", label: "Watered", icon: Droplets, color: "text-blue-500" },
  { value: "feed", label: "Fed Nutrients", icon: FlaskConical, color: "text-green-500" },
  { value: "light", label: "Light Adjusted", icon: Sun, color: "text-yellow-500" },
  { value: "prune", label: "Pruned", icon: Scissors, color: "text-orange-500" },
  { value: "transplant", label: "Transplanted", icon: ArrowRightLeft, color: "text-purple-500" },
  { value: "note", label: "Note", icon: StickyNote, color: "text-muted-foreground" },
];

interface Plant {
  id: string;
  plant_name: string;
  strain_name: string | null;
  strain_type: string | null;
  growth_stage: string;
  planted_date: string;
  notes: string | null;
  created_at: string;
}

interface CareLog {
  id: string;
  log_type: string;
  log_date: string;
  details: any;
  notes: string | null;
  created_at: string;
}

interface EnvLog {
  id: string;
  temperature: number | null;
  humidity: number | null;
  ph_level: number | null;
  light_hours: number | null;
  nutrient_ppm: number | null;
  logged_at: string;
  notes: string | null;
}

const SeedlingMonitor = () => {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [envLogs, setEnvLogs] = useState<EnvLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPlantOpen, setAddPlantOpen] = useState(false);
  const [addEnvOpen, setAddEnvOpen] = useState(false);
  const [aiTips, setAiTips] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Add plant form
  const [newPlant, setNewPlant] = useState({ plant_name: "", strain_name: "", strain_type: "Hybrid", notes: "" });
  // Add env form
  const [newEnv, setNewEnv] = useState({ temperature: "", humidity: "", ph_level: "", light_hours: "", nutrient_ppm: "", notes: "" });

  // Settings
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => {
    try {
      const raw = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      return raw ? { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(raw) } : DEFAULT_GLOBAL_SETTINGS;
    } catch { return DEFAULT_GLOBAL_SETTINGS; }
  });
  const [plantSettings, setPlantSettings] = useState<PlantSettings>(DEFAULT_PLANT_SETTINGS);

  useEffect(() => {
    try { localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(globalSettings)); } catch {}
  }, [globalSettings]);

  useEffect(() => {
    if (!selectedPlant) return;
    try {
      const raw = localStorage.getItem(plantSettingsKey(selectedPlant.id));
      setPlantSettings(raw ? { ...DEFAULT_PLANT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_PLANT_SETTINGS);
    } catch { setPlantSettings(DEFAULT_PLANT_SETTINGS); }
  }, [selectedPlant?.id]);

  const updatePlantSettings = (patch: Partial<PlantSettings>) => {
    setPlantSettings(prev => {
      const next = { ...prev, ...patch };
      if (selectedPlant) {
        try { localStorage.setItem(plantSettingsKey(selectedPlant.id), JSON.stringify(next)); } catch {}
      }
      return next;
    });
  };

  useEffect(() => {
    if (user) fetchPlants();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    if (selectedPlant) {
      fetchCareLogs(selectedPlant.id);
      fetchEnvLogs(selectedPlant.id);
    }
  }, [selectedPlant]);

  const fetchPlants = async () => {
    const { data, error } = await supabase.from("plants").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setPlants(data as Plant[]);
      if (data.length > 0 && !selectedPlant) setSelectedPlant(data[0] as Plant);
    }
    setLoading(false);
  };

  const fetchCareLogs = async (plantId: string) => {
    const { data } = await supabase.from("plant_care_logs").select("*").eq("plant_id", plantId).order("log_date", { ascending: false }).limit(50);
    if (data) setCareLogs(data as CareLog[]);
  };

  const fetchEnvLogs = async (plantId: string) => {
    const { data } = await supabase.from("plant_environment_logs").select("*").eq("plant_id", plantId).order("logged_at", { ascending: false }).limit(50);
    if (data) setEnvLogs(data as EnvLog[]);
  };

  const addPlant = async () => {
    if (!user || !newPlant.plant_name.trim()) return;
    const { error } = await supabase.from("plants").insert({
      user_id: user.id,
      plant_name: newPlant.plant_name.trim(),
      strain_name: newPlant.strain_name.trim() || null,
      strain_type: newPlant.strain_type,
      notes: newPlant.notes.trim() || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Plant added! 🌱" });
    setNewPlant({ plant_name: "", strain_name: "", strain_type: "Hybrid", notes: "" });
    setAddPlantOpen(false);
    fetchPlants();
  };

  const updateGrowthStage = async (stage: string) => {
    if (!selectedPlant) return;
    const { error } = await supabase.from("plants").update({ growth_stage: stage }).eq("id", selectedPlant.id);
    if (!error) {
      setSelectedPlant({ ...selectedPlant, growth_stage: stage });
      setPlants(plants.map(p => p.id === selectedPlant.id ? { ...p, growth_stage: stage } : p));
      toast({ title: `Stage updated to ${GROWTH_STAGES.find(s => s.value === stage)?.label}` });
    }
  };

  const addCareLog = async (logType: string) => {
    if (!user || !selectedPlant) return;
    const { error } = await supabase.from("plant_care_logs").insert({
      plant_id: selectedPlant.id,
      user_id: user.id,
      log_type: logType,
    });
    if (!error) {
      toast({ title: `${LOG_TYPES.find(l => l.value === logType)?.label} logged ✓` });
      fetchCareLogs(selectedPlant.id);
    }
  };

  const addEnvLog = async () => {
    if (!user || !selectedPlant) return;
    const { error } = await supabase.from("plant_environment_logs").insert({
      plant_id: selectedPlant.id,
      user_id: user.id,
      temperature: newEnv.temperature ? parseFloat(newEnv.temperature) : null,
      humidity: newEnv.humidity ? parseFloat(newEnv.humidity) : null,
      ph_level: newEnv.ph_level ? parseFloat(newEnv.ph_level) : null,
      light_hours: newEnv.light_hours ? parseFloat(newEnv.light_hours) : null,
      nutrient_ppm: newEnv.nutrient_ppm ? parseFloat(newEnv.nutrient_ppm) : null,
      notes: newEnv.notes.trim() || null,
    });
    if (!error) {
      toast({ title: "Environment logged 🌡️" });
      setNewEnv({ temperature: "", humidity: "", ph_level: "", light_hours: "", nutrient_ppm: "", notes: "" });
      setAddEnvOpen(false);
      fetchEnvLogs(selectedPlant.id);
    }
  };

  const deletePlant = async (plantId: string) => {
    const { error } = await supabase.from("plants").delete().eq("id", plantId);
    if (!error) {
      toast({ title: "Plant removed" });
      if (selectedPlant?.id === plantId) setSelectedPlant(null);
      fetchPlants();
    }
  };

  const getAiTips = async () => {
    if (!selectedPlant) return;
    setAiLoading(true);
    setAiTips("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: "Sign in required", description: "Please sign in to get AI care tips.", variant: "destructive" });
        setAiLoading(false);
        return;
      }
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plant-care-tips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          plantName: selectedPlant.plant_name,
          strainName: selectedPlant.strain_name,
          strainType: selectedPlant.strain_type,
          growthStage: selectedPlant.growth_stage,
          recentCareLogs: careLogs.slice(0, 5),
          recentEnvLogs: envLogs.slice(0, 3),
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to get tips");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { fullText += content; setAiTips(fullText); }
          } catch {}
        }
      }
    } catch (e) {
      toast({ title: "Error getting AI tips", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const stageInfo = GROWTH_STAGES.find(s => s.value === selectedPlant?.growth_stage) || GROWTH_STAGES[0];

  // Reminders from care logs + intervals
  const daysSince = (iso?: string) => iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null;
  const lastWater = careLogs.find(l => l.log_type === "water")?.log_date;
  const lastFeed = careLogs.find(l => l.log_type === "feed")?.log_date;
  const waterDue = lastWater ? (daysSince(lastWater) ?? 0) >= plantSettings.waterIntervalDays : true;
  const feedDue = lastFeed ? (daysSince(lastFeed) ?? 0) >= plantSettings.feedIntervalDays : true;
  const tempUnitLabel = globalSettings.tempUnit === "C" ? "°C" : "°F";

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-32">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Sprout className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle>Seedling Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sign in to track your plants, log care activities, and get AI-powered growing tips.</p>
            <Link to="/auth"><Button>Sign In to Start</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <SEO title="Seedling Monitor - Cuddles AI" description="Track your cannabis plants with AI-powered care tips, growth stage tracking, and environment monitoring." url="/grow" />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Sprout className="w-8 h-8 text-primary" /> Seedling Monitor
            </h1>
            <p className="text-muted-foreground mt-1">Track, nurture, and grow with AI guidance</p>
          </div>
          <Dialog open={addPlantOpen} onOpenChange={setAddPlantOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Plant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Plant</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Plant name (e.g. 'Baby Kush #1')" value={newPlant.plant_name} onChange={e => setNewPlant({ ...newPlant, plant_name: e.target.value })} />
                <Input placeholder="Strain name (optional)" value={newPlant.strain_name} onChange={e => setNewPlant({ ...newPlant, strain_name: e.target.value })} />
                <Select value={newPlant.strain_type} onValueChange={v => setNewPlant({ ...newPlant, strain_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indica">Indica</SelectItem>
                    <SelectItem value="Sativa">Sativa</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Autoflower">Autoflower</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Notes (optional)" value={newPlant.notes} onChange={e => setNewPlant({ ...newPlant, notes: e.target.value })} />
                <Button onClick={addPlant} className="w-full" disabled={!newPlant.plant_name.trim()}>Add Plant 🌱</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {plants.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Sprout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No plants yet</h3>
              <p className="text-muted-foreground mb-4">Add your first plant to start tracking!</p>
              <Button onClick={() => setAddPlantOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Your First Plant</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Plant list sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Your Plants</h3>
              {plants.map(plant => (
                <button
                  key={plant.id}
                  onClick={() => setSelectedPlant(plant)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedPlant?.id === plant.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{plant.plant_name}</p>
                      <p className="text-xs text-muted-foreground">{plant.strain_name || "Unknown strain"}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{GROWTH_STAGES.find(s => s.value === plant.growth_stage)?.label.split(" ")[0]}</Badge>
                  </div>
                </button>
              ))}
            </div>

            {/* Main content */}
            {selectedPlant && (
              <div className="lg:col-span-3 space-y-6">
                {/* Growth stage tracker */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedPlant.plant_name}</CardTitle>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePlant(selectedPlant.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPlant.strain_name && <Badge variant="secondary">{selectedPlant.strain_name}</Badge>}
                      <Badge variant="outline">{selectedPlant.strain_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">Growth Stage</p>
                    <Progress value={stageInfo.progress} className="h-3 mb-4" />
                    <div className="flex gap-2 flex-wrap">
                      {GROWTH_STAGES.map(stage => (
                        <Button
                          key={stage.value}
                          variant={selectedPlant.growth_stage === stage.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateGrowthStage(stage.value)}
                        >
                          {stage.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reminders */}
                {globalSettings.notificationsEnabled && (waterDue || feedDue) && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="py-3 flex items-start gap-3">
                      <Bell className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium mb-1">Care reminders</p>
                        <ul className="text-muted-foreground space-y-0.5">
                          {waterDue && (
                            <li>💧 Water due {lastWater ? `(last watered ${daysSince(lastWater)}d ago)` : "(no log yet)"}</li>
                          )}
                          {feedDue && (
                            <li>🧪 Feed due {lastFeed ? `(last fed ${daysSince(lastFeed)}d ago)` : "(no log yet)"}</li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Tabs defaultValue="care" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="care">Care Log</TabsTrigger>
                    <TabsTrigger value="environment">Environment</TabsTrigger>
                    <TabsTrigger value="ai">AI Tips</TabsTrigger>
                    <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-1 hidden sm:inline" />Settings</TabsTrigger>
                  </TabsList>

                  {/* Care Log Tab */}
                  <TabsContent value="care" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Quick Log</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {LOG_TYPES.map(logType => (
                            <Button key={logType.value} variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-3" onClick={() => addCareLog(logType.value)}>
                              <logType.icon className={`w-5 h-5 ${logType.color}`} />
                              <span className="text-xs">{logType.label}</span>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      {careLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No care logs yet. Use the quick log buttons above!</p>
                      ) : (
                        careLogs.map(log => {
                          const logInfo = LOG_TYPES.find(l => l.value === log.log_type);
                          const Icon = logInfo?.icon || StickyNote;
                          return (
                            <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                              <Icon className={`w-5 h-5 ${logInfo?.color || "text-muted-foreground"}`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{logInfo?.label || log.log_type}</p>
                                {log.notes && <p className="text-xs text-muted-foreground">{log.notes}</p>}
                              </div>
                              <p className="text-xs text-muted-foreground">{new Date(log.log_date).toLocaleDateString()}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>

                  {/* Environment Tab */}
                  <TabsContent value="environment" className="space-y-4">
                    <div className="flex justify-end">
                      <Dialog open={addEnvOpen} onOpenChange={setAddEnvOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Log Environment</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Log Environment</DialogTitle></DialogHeader>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">Temp ({tempUnitLabel})</label>
                              <Input type="number" placeholder={globalSettings.tempUnit === "C" ? "24" : "75"} value={newEnv.temperature} onChange={e => setNewEnv({ ...newEnv, temperature: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Humidity (%)</label>
                              <Input type="number" placeholder="60" value={newEnv.humidity} onChange={e => setNewEnv({ ...newEnv, humidity: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">pH Level</label>
                              <Input type="number" step="0.1" placeholder="6.5" value={newEnv.ph_level} onChange={e => setNewEnv({ ...newEnv, ph_level: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Light (hrs)</label>
                              <Input type="number" placeholder="18" value={newEnv.light_hours} onChange={e => setNewEnv({ ...newEnv, light_hours: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs text-muted-foreground">Nutrient PPM</label>
                              <Input type="number" placeholder="800" value={newEnv.nutrient_ppm} onChange={e => setNewEnv({ ...newEnv, nutrient_ppm: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                              <Textarea placeholder="Notes (optional)" value={newEnv.notes} onChange={e => setNewEnv({ ...newEnv, notes: e.target.value })} />
                            </div>
                          </div>
                          <Button onClick={addEnvLog} className="w-full">Save Reading 🌡️</Button>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {envLogs.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <Thermometer className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No environment data yet. Log your first reading!</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {envLogs.map(log => (
                          <Card key={log.id}>
                            <CardContent className="py-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-muted-foreground">{new Date(log.logged_at).toLocaleString()}</p>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                                {log.temperature != null && (
                                  <div className="flex items-center gap-1.5">
                                    <Thermometer className="w-4 h-4 text-red-400" />
                                    <span>{toDisplayTemp(log.temperature, globalSettings.tempUnit)}{tempUnitLabel}</span>
                                  </div>
                                )}
                                {log.humidity != null && (
                                  <div className="flex items-center gap-1.5">
                                    <Droplets className="w-4 h-4 text-blue-400" />
                                    <span>{log.humidity}%</span>
                                  </div>
                                )}
                                {log.ph_level != null && (
                                  <div className="flex items-center gap-1.5">
                                    <FlaskConical className="w-4 h-4 text-green-400" />
                                    <span>pH {log.ph_level}</span>
                                  </div>
                                )}
                                {log.light_hours != null && (
                                  <div className="flex items-center gap-1.5">
                                    <Sun className="w-4 h-4 text-yellow-400" />
                                    <span>{log.light_hours}hrs</span>
                                  </div>
                                )}
                                {log.nutrient_ppm != null && (
                                  <div className="flex items-center gap-1.5">
                                    <Leaf className="w-4 h-4 text-emerald-400" />
                                    <span>{log.nutrient_ppm} PPM</span>
                                  </div>
                                )}
                              </div>
                              {log.notes && <p className="text-xs text-muted-foreground mt-2">{log.notes}</p>}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* AI Tips Tab */}
                  <TabsContent value="ai" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" /> AI Care Advisor
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Get personalized growing advice based on your plant's stage, strain, and logged conditions.
                        </p>
                        <Button onClick={getAiTips} disabled={aiLoading}>
                          {aiLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...</> : <><Sparkles className="w-4 h-4 mr-2" /> Get AI Tips</>}
                        </Button>
                      </CardContent>
                    </Card>

                    {aiTips && (
                      <Card>
                        <CardContent className="py-4 prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{aiTips}</ReactMarkdown>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Ruler className="w-5 h-5 text-primary" /> Grow Setup
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Environment</Label>
                            <Select value={plantSettings.growEnvironment} onValueChange={(v: any) => updatePlantSettings({ growEnvironment: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="indoor">Indoor</SelectItem>
                                <SelectItem value="outdoor">Outdoor</SelectItem>
                                <SelectItem value="greenhouse">Greenhouse</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Grow Medium</Label>
                            <Select value={plantSettings.growMedium} onValueChange={(v: any) => updatePlantSettings({ growMedium: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="soil">Soil</SelectItem>
                                <SelectItem value="coco">Coco Coir</SelectItem>
                                <SelectItem value="hydro">Hydroponic</SelectItem>
                                <SelectItem value="aero">Aeroponic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Pot Size (gallons)</Label>
                            <Input type="number" value={plantSettings.potSize} onChange={e => updatePlantSettings({ potSize: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Light Type</Label>
                            <Select value={plantSettings.lightType} onValueChange={(v: any) => updatePlantSettings({ lightType: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LED">LED</SelectItem>
                                <SelectItem value="HPS">HPS</SelectItem>
                                <SelectItem value="CFL">CFL</SelectItem>
                                <SelectItem value="Sun">Natural Sun</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs">Light Schedule</Label>
                            <Select value={plantSettings.lightSchedule} onValueChange={(v: any) => updatePlantSettings({ lightSchedule: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="18/6">18/6 (Vegetative)</SelectItem>
                                <SelectItem value="20/4">20/4 (Aggressive Veg)</SelectItem>
                                <SelectItem value="12/12">12/12 (Flowering)</SelectItem>
                                <SelectItem value="24/0">24/0 (Autoflower)</SelectItem>
                                <SelectItem value="Natural">Natural Daylight</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="w-5 h-5 text-primary" /> Care Reminders
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">Water every {plantSettings.waterIntervalDays} day(s)</Label>
                          </div>
                          <Slider min={1} max={14} step={1} value={[plantSettings.waterIntervalDays]} onValueChange={([v]) => updatePlantSettings({ waterIntervalDays: v })} />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">Feed every {plantSettings.feedIntervalDays} day(s)</Label>
                          </div>
                          <Slider min={1} max={21} step={1} value={[plantSettings.feedIntervalDays]} onValueChange={([v]) => updatePlantSettings({ feedIntervalDays: v })} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Thermometer className="w-5 h-5 text-primary" /> Target Ranges
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Temp Min ({tempUnitLabel})</Label>
                            <Input
                              type="number"
                              value={toDisplayTemp(plantSettings.targetTempMin, globalSettings.tempUnit) ?? ""}
                              onChange={e => updatePlantSettings({ targetTempMin: fromInputTemp(parseFloat(e.target.value) || 0, globalSettings.tempUnit) })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Temp Max ({tempUnitLabel})</Label>
                            <Input
                              type="number"
                              value={toDisplayTemp(plantSettings.targetTempMax, globalSettings.tempUnit) ?? ""}
                              onChange={e => updatePlantSettings({ targetTempMax: fromInputTemp(parseFloat(e.target.value) || 0, globalSettings.tempUnit) })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Humidity Min (%)</Label>
                            <Input type="number" value={plantSettings.targetHumidityMin} onChange={e => updatePlantSettings({ targetHumidityMin: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Humidity Max (%)</Label>
                            <Input type="number" value={plantSettings.targetHumidityMax} onChange={e => updatePlantSettings({ targetHumidityMax: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">pH Min</Label>
                            <Input type="number" step="0.1" value={plantSettings.targetPhMin} onChange={e => updatePlantSettings({ targetPhMin: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">pH Max</Label>
                            <Input type="number" step="0.1" value={plantSettings.targetPhMax} onChange={e => updatePlantSettings({ targetPhMax: parseFloat(e.target.value) || 0 })} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <SettingsIcon className="w-5 h-5 text-primary" /> Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Temperature unit</Label>
                            <p className="text-xs text-muted-foreground">Switch between Fahrenheit and Celsius</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={globalSettings.tempUnit === "F" ? "text-foreground" : "text-muted-foreground"}>°F</span>
                            <Switch
                              checked={globalSettings.tempUnit === "C"}
                              onCheckedChange={c => setGlobalSettings({ ...globalSettings, tempUnit: c ? "C" : "F" })}
                            />
                            <span className={globalSettings.tempUnit === "C" ? "text-foreground" : "text-muted-foreground"}>°C</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Care reminders</Label>
                            <p className="text-xs text-muted-foreground">Show watering & feeding alerts</p>
                          </div>
                          <Switch
                            checked={globalSettings.notificationsEnabled}
                            onCheckedChange={c => setGlobalSettings({ ...globalSettings, notificationsEnabled: c })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Weekly grow summary</Label>
                            <p className="text-xs text-muted-foreground">Email a recap of your plants every Sunday</p>
                          </div>
                          <Switch
                            checked={globalSettings.weeklySummary}
                            onCheckedChange={c => setGlobalSettings({ ...globalSettings, weeklySummary: c })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Auto AI tips on stage change</Label>
                            <p className="text-xs text-muted-foreground">Generate fresh tips when you advance growth stages</p>
                          </div>
                          <Switch
                            checked={globalSettings.aiAutoTips}
                            onCheckedChange={c => setGlobalSettings({ ...globalSettings, aiAutoTips: c })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeedlingMonitor;
