import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const VIDEO_POPUP_KEY = "cuddles_video_seen";
const POPUP_DELAY_MS = 8000; // Show after 8 seconds

const VideoPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(VIDEO_POPUP_KEY);
    if (seen) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(VIDEO_POPUP_KEY, "1");
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[hsl(270,40%,12%)] border-white/10">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-white text-lg font-semibold">
            Meet Cuddles 🌿
          </DialogTitle>
        </DialogHeader>
        <div className="w-full aspect-square">
          <video
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
              setOpen(false);
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
