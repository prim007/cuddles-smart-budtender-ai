import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
  /** Tailwind background classes for the screen area */
  screenClassName?: string;
}

/**
 * Realistic iPhone-style device frame.
 * Use to wrap any chat/UI content so it appears as if running on a phone.
 */
const PhoneFrame = ({ children, className, screenClassName }: PhoneFrameProps) => {
  return (
    <div
      className={cn(
        "relative mx-auto w-[280px] sm:w-[300px] md:w-[320px] aspect-[9/19] rounded-[3rem] bg-gradient-to-b from-zinc-900 to-zinc-800 p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10",
        className
      )}
    >
      {/* Side buttons */}
      <div className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l bg-zinc-700" />
      <div className="absolute -left-[3px] top-36 h-12 w-[3px] rounded-l bg-zinc-700" />
      <div className="absolute -left-[3px] top-52 h-12 w-[3px] rounded-l bg-zinc-700" />
      <div className="absolute -right-[3px] top-32 h-16 w-[3px] rounded-r bg-zinc-700" />

      {/* Screen */}
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-[2.3rem] bg-background",
          screenClassName
        )}
      >
        {/* Dynamic island / notch */}
        <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

        {/* Status bar */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-2.5 text-[10px] font-semibold text-white/90">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span>●●●●</span>
            <span>100%</span>
          </span>
        </div>

        <div className="relative z-0 h-full w-full pt-9">{children}</div>
      </div>
    </div>
  );
};

export default PhoneFrame;
