import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

const VIDEO_POPUP_KEY = "cuddles_video_seen";
const POPUP_DELAY_MS = 8000;

const NARRATION_LINES = [
  { time: 0, text: "Hey there! I'm Cuddles, your smart AI budtender!" },
  { time: 4, text: "Choosing cannabis can be overwhelming. Too many strains, confusing effects, and bad recommendations." },
  { time: 9, text: "That's where I come in! I use AI to match you with the perfect strain with 95 percent accuracy." },
  { time: 14, text: "Tell me what you need. I analyze over a thousand strains and give you your perfect match!" },
  { time: 18, text: "Try Cuddles AI for free! No signup needed. Visit cuddles ai dot com!" },
];

const VideoPopup = () => {
  const [open, setOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const seen = sessionStorage.getItem(VIDEO_POPUP_KEY);
    if (seen) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(VIDEO_POPUP_KEY, "1");
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const startNarration = () => {
    if (!("speechSynthesis" in window)) return;
    stopNarration();
    setIsSpeaking(true);

    NARRATION_LINES.forEach((line) => {
      const timer = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.rate = 1.0;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        // Try to pick a female voice
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(
          (v) => v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Moira") || v.name.includes("Google UK English Female")
        );
        if (femaleVoice) utterance.voice = femaleVoice;
        utterancesRef.current.push(utterance);
        speechSynthesis.speak(utterance);
      }, line.time * 1000);
      timersRef.current.push(timer);
    });
  };

  const stopNarration = () => {
    speechSynthesis.cancel();
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    utterancesRef.current = [];
    setIsSpeaking(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) stopNarration();
  };

  useEffect(() => {
    if (open) {
      // Load voices first (they may not be available immediately)
      speechSynthesis.getVoices();
      const timer = setTimeout(startNarration, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    return () => stopNarration();
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-video-popup={open ? "true" : undefined} className="sm:max-w-[500px] p-0 overflow-hidden bg-[hsl(270,40%,12%)] border-white/10">
        <DialogHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-white text-lg font-semibold">
            Meet Cuddles 🌿
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isSpeaking) stopNarration();
              else startNarration();
            }}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </DialogHeader>
        <div className="w-full aspect-square">
          <video
            ref={videoRef}
            src="/videos/cuddles-explainer.mp4"
            autoPlay
            muted
            playsInline
            loop
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 pt-2 flex justify-center">
          <Button
            onClick={() => {
              handleOpenChange(false);
              document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl px-6"
          >
            🌿 Try Cuddles Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPopup;
