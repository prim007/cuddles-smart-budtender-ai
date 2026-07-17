import { ReactNode, useRef, useState, useEffect } from "react";

interface Phone3DProps {
  children: ReactNode;
  index?: number;
}

/**
 * 3D interactive wrapper for a phone mockup.
 * - Mouse-tracked tilt (perspective + rotateX/Y)
 * - Continuous float animation
 * - Abstract gradient orbs & prismatic shimmer behind the device
 */
const Phone3D = ({ children, index = 0 }: Phone3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 18, y: px * 22 });
  };

  const onLeave = () => {
    setHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  const floatDelay = `${index * 0.6}s`;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={onLeave}
      className="relative"
      style={{ perspective: "1400px" }}
    >
      {/* Abstract backdrop orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-16 -z-10 overflow-visible"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "conic-gradient(from 120deg at 50% 50%, hsl(var(--hippie-coral)/0.55), hsl(var(--hippie-amber)/0.45), hsl(var(--hippie-teal)/0.4), hsl(var(--hippie-lavender)/0.5), hsl(var(--hippie-coral)/0.55))",
            animation: "phone3d-spin 18s linear infinite",
          }}
        />
        <div
          className="absolute -left-8 top-6 h-32 w-32 rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, hsl(var(--hippie-coral)/0.7), transparent 70%)",
            animation: "phone3d-float 7s ease-in-out infinite",
            animationDelay: floatDelay,
          }}
        />
        <div
          className="absolute -right-6 bottom-4 h-40 w-40 rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, hsl(var(--hippie-teal)/0.6), transparent 70%)",
            animation: "phone3d-float 9s ease-in-out infinite reverse",
            animationDelay: floatDelay,
          }}
        />
      </div>

      {/* Tilting stage */}
      <div
        className="relative transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: visible
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovering ? 1.04 : 1})`
            : "rotateY(-25deg) translateY(40px)",
          transformStyle: "preserve-3d",
          opacity: visible ? 1 : 0,
          transitionProperty: "transform, opacity",
          transitionDuration: hovering ? "150ms" : "800ms",
        }}
      >
        {/* Float wrapper (only when idle) */}
        <div
          style={{
            animation: hovering ? "none" : "phone3d-float 6s ease-in-out infinite",
            animationDelay: floatDelay,
            transform: "translateZ(0)",
          }}
        >
          {/* Prismatic edge glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-[3.3rem] opacity-70 blur-md"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--hippie-coral)) 0%, hsl(var(--hippie-amber)) 35%, hsl(var(--hippie-teal)) 70%, hsl(var(--hippie-lavender)) 100%)",
              transform: "translateZ(-40px)",
            }}
          />
          {/* Shimmer sweep */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[3rem]"
            style={{ transform: "translateZ(20px)" }}
          >
            <div
              className="absolute -inset-y-8 -left-1/2 w-1/2 rotate-12"
              style={{
                background:
                  "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.35), transparent)",
                animation: "phone3d-shimmer 4.5s ease-in-out infinite",
                animationDelay: `${index * 1.2}s`,
              }}
            />
          </div>

          <div style={{ transform: "translateZ(60px)" }}>{children}</div>

          {/* Ground reflection */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-[50%] bg-black/40 blur-xl"
            style={{ transform: "translateZ(-80px) rotateX(80deg)" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes phone3d-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes phone3d-spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes phone3d-shimmer {
          0% { transform: translateX(0) rotate(12deg); }
          60%, 100% { transform: translateX(500%) rotate(12deg); }
        }
      `}</style>
    </div>
  );
};

export default Phone3D;
