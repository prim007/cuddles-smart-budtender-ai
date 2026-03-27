import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

export const Scene4HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { num: "1", title: "Tell me what you need", desc: "Sleep? Energy? Pain relief?", delay: 15 },
    { num: "2", title: "I analyze 1000+ strains", desc: "Using real terpene data", delay: 45 },
    { num: "3", title: "Get your perfect match", desc: "Personalized just for you", delay: 75 },
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1a0a2e 0%, #0f172a 50%, #1e1b4b 100%)",
        padding: 60,
        justifyContent: "center",
      }}
    >
      {/* Ambient orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          top: -100 + Math.sin(frame * 0.02) * 20,
          left: -100,
        }}
      />

      {/* Title */}
      <div
        style={{
          textAlign: "center",
          opacity: titleOpacity,
          marginBottom: 70,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 52,
            fontWeight: 800,
            color: "white",
          }}
        >
          How it works ✨
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
        {steps.map((s, i) => {
          const sFrame = frame - s.delay;
          const sScale = sFrame > 0 ? spring({ frame: sFrame, fps, config: { damping: 14 } }) : 0;
          const sX = interpolate(sScale, [0, 1], [i % 2 === 0 ? -120 : 120, 0]);

          // Connecting line
          const lineHeight = i < steps.length - 1
            ? interpolate(frame, [s.delay + 20, s.delay + 40], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "24px 36px",
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  width: 700,
                  transform: `translateX(${sX}px)`,
                  opacity: sScale,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {s.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: 20,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 4,
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 3,
                    height: 30,
                    background: `linear-gradient(to bottom, rgba(139,92,246,${lineHeight}), rgba(236,72,153,${lineHeight}))`,
                    borderRadius: 2,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
