import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Accessibility, Check, RotateCcw, Settings2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAccessibility, type HandSide } from "@/contexts/AccessibilityContext";
import { useAnnouncer } from "@/contexts/AnnouncerContext";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

const voicePath = (command: string): string | null => {
  if (/\b(home|homepage|start)\b/.test(command)) return "/";
  if (/\b(chat|budtender|cuddles chat)\b/.test(command)) return "/ai-budtender";
  if (/what is cuddles|about cuddles/.test(command)) return "/what-is-cuddles";
  if (/\b(blog|articles|learn)\b/.test(command)) return "/blog";
  if (/\b(grow|growing|garden)\b/.test(command)) return "/grow";
  if (/\b(strains|strain guide)\b/.test(command)) return "/strains/featured";
  return null;
};

const AccessibilityPanel = () => {
  const settings = useAccessibility();
  const { announce } = useAnnouncer();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleVoiceCommand = useCallback((spoken: string) => {
    const command = spoken.toLowerCase().trim();
    if (/\b(stop|quiet|turn off) listening\b/.test(command)) {
      settings.set("voiceNav", false);
      announce("Voice navigation off");
      return;
    }
    if (/\b(undo|undo that|take it back)\b/.test(command)) {
      window.dispatchEvent(new CustomEvent("cuddles-undo-last"));
      announce("Undo requested");
      return;
    }
    if (/\bscroll\s+(down|lower)\b/.test(command)) {
      window.scrollBy({ top: Math.max(320, window.innerHeight * 0.7), behavior: "smooth" });
      announce("Scrolled down");
      return;
    }
    if (/\bscroll\s+(up|back)\b/.test(command)) {
      window.scrollBy({ top: -Math.max(320, window.innerHeight * 0.7), behavior: "smooth" });
      announce("Scrolled up");
      return;
    }
    if (/\b(read|read this|read page)\b/.test(command)) {
      const text = document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 700);
      if (text && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        announce("Reading the page");
      }
      return;
    }
    const path = voicePath(command);
    if (path) {
      navigate(path);
      announce(`Opening ${path === "/" ? "home" : path.slice(1).replaceAll("-", " ")}`);
      return;
    }
    announce("I did not recognise that command");
  }, [announce, navigate, settings]);

  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    continuous: true,
    onResult: handleVoiceCommand,
    onError: (message) => announce(message),
  });

  useEffect(() => {
    if (!settings.voiceNav || !isSupported) {
      if (isListening) stopListening();
      return;
    }
    startListening();
  }, [isListening, isSupported, settings.voiceNav, startListening, stopListening]);

  const updateHand = (value: string) => settings.set("oneHanded", value as HandSide);

  return (
    <div className="fixed right-4 top-4 z-[60] md:right-6 md:top-5 a11y-panel">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11 rounded-full border-border bg-card/95 text-foreground shadow-elevated backdrop-blur-sm"
            aria-label="Open accessibility settings"
            title="Accessibility settings"
          >
            <Accessibility className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={10} className="w-[min(22rem,calc(100vw-2rem))] space-y-5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary"><Settings2 className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">Accessibility</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose the way Cuddles works best for you.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="a11y-contrast" className="leading-5">High contrast</Label>
              <Switch id="a11y-contrast" checked={settings.highContrast} onCheckedChange={(value) => settings.set("highContrast", value)} aria-label="High contrast" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="a11y-cues" className="leading-5">Audio cues</Label>
              <Switch id="a11y-cues" checked={settings.audioCues} onCheckedChange={(value) => settings.set("audioCues", value)} aria-label="Audio cues" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="a11y-voice" className="leading-5">Voice navigation</Label>
              <Switch id="a11y-voice" checked={settings.voiceNav} onCheckedChange={(value) => settings.set("voiceNav", value)} aria-label="Voice navigation" />
            </div>
            {settings.voiceNav && !isSupported && <p className="text-xs text-muted-foreground">Voice navigation is not available in this browser.</p>}
            {settings.voiceNav && isSupported && <p className="text-xs text-primary" role="status">{isListening ? "Listening for a command" : "Starting voice navigation"}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="a11y-font">Text size: {settings.fontScale}%</Label>
            <Slider id="a11y-font" min={90} max={180} step={10} value={[settings.fontScale]} onValueChange={([value]) => settings.set("fontScale", value ?? 100)} aria-label="Text size" />
            <div className="flex justify-between text-xs text-muted-foreground"><span>90%</span><span>180%</span></div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="a11y-hand">One-handed layout</Label>
            <Select value={settings.oneHanded} onValueChange={updateHand}>
              <SelectTrigger id="a11y-hand" className="min-h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Standard layout</SelectItem>
                <SelectItem value="left">Left hand</SelectItem>
                <SelectItem value="right">Right hand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="a11y-debounce">Press protection</Label>
            <Select value={String(settings.debounceMs)} onValueChange={(value) => settings.set("debounceMs", Number(value))}>
              <SelectTrigger id="a11y-debounce" className="min-h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Off</SelectItem>
                <SelectItem value="500">Gentle · 0.5 sec</SelectItem>
                <SelectItem value="1000">Strong · 1 sec</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><Volume2 className="h-4 w-4" /> Replies are announced in chunks</p>
            <Button variant="ghost" size="sm" onClick={() => { settings.reset(); announce("Accessibility settings reset"); }} className="min-h-11 gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
          <p className="sr-only" aria-live="polite">Current page: {location.pathname}</p>
        </PopoverContent>
      </Popover>
      {isListening && <span className={cn("sr-only")}>Voice navigation is listening</span>}
    </div>
  );
};

export default AccessibilityPanel;
