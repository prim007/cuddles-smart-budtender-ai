import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, UserPlus } from "lucide-react";

const VIDEO_POPUP_KEY = "cuddles_video_seen";
const POPUP_DELAY_MS = 120000; // 2 minutes

const VideoPopup = () => {
  const [open, setOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem(VIDEO_POPUP_KEY);
    if (seen) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(VIDEO_POPUP_KEY, "1");
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-video-popup={open ? "true" : undefined} className="sm:max-w-[340px] p-0 overflow-hidden bg-[hsl(270,40%,12%)] border-white/10">
        <DialogHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-white text-lg font-semibold">
            Meet Cuddles 🌿
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </DialogHeader>
        <div className="w-full aspect-square">
          <video
            ref={videoRef}
            src="/videos/cuddles-explainer.mp4"
            autoPlay
            playsInline
            loop
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 pt-2 flex flex-col gap-2 items-center">
          <Link to="/auth" className="w-full flex justify-center">
            <Button
              onClick={() => handleOpenChange(false)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl px-6 w-full gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up Free — It Takes 10 Seconds
            </Button>
          </Link>
          <button
            onClick={() => {
              handleOpenChange(false);
              document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-xs text-white/40 hover:text-white/60 underline"
          >
            Try without signing up
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPopup;
