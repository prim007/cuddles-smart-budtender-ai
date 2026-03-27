import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";

export const Scene3Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cuddles center entrance
  const cuddlesScale = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const float = Math.sin(frame * 0.06) * 10;

  // Title reveal
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [15, 35], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Features
  const features = [
    { icon: "🎯", text: "AI-Powered Matches", sub: "95% accuracy", delay: 40 },
    { icon: "⚡", text: "Instant Results", sub: "Under 2 seconds", delay: 55 },
    { icon: "🧬", text: "Terpene Analysis", sub: "Deep strain science", delay: 70 },
  ];

  // Glowing ring around Cuddles
  const ringScale = spring({ frame: frame - 5, fps, config: { damping: 20 } });
  const ringOpacity = interpolate(frame, [5, 20, 80, 120], [0, 0.6, 0.6, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0f1a0f 0%, #1a2e1a 40%, #1f3d1f 70%, #1a3320 100%)",
        alignItems: "center",
      }}
    >
      {/* Green ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Glowing ring */}
      <div
        style={{
          position: "absolute",
          top: 80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "3px solid rgba(74,222,128,0.4)",
          boxShadow: "0 0 40px rgba(74,222,128,0.3), inset 0 0 40px rgba(74,222,128,0.1)",
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />

      {/* Cuddles */}
      <Img
        src={staticFile("images/cuddles.png")}
        style={{
          width: 280,
          height: 280,
          objectFit: "contain",
          marginTop: 90,
          transform: `scale(${cuddlesScale}) translateY(${float}px)`,
        }}
      />

      {/* Title */}
      <div
        style={{
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginTop: 20,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 50,
            fontWeight: 800,
            color: "white",
          }}
        >
          That's where{" "}
          <span style={{ color: "#4ade80" }}>I</span> come in!
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 26,
            color: "rgba(255,255,255,0.6)",
            marginTop: 8,
          }}
        >
          Your AI-powered smart budtender
        </div>
      </div>

      {/* Feature cards */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 50,
          padding: "0 40px",
        }}
      >
        {features.map((f, i) => {
          const fFrame = frame - f.delay;
          const fScale = fFrame > 0 ? spring({ frame: fFrame, fps, config: { damping: 12 } }) : 0;
          const fY = interpolate(fScale, [0, 1], [60, 0]);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "28px 16px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(74,222,128,0.2)",
                transform: `translateY(${fY}px)`,
                opacity: fScale,
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>{f.icon}</div>
              <div
                style={{
                  fontFamily: "sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 6,
                }}
              >
                {f.text}
              </div>
              <div
                style={{
                  fontFamily: "sans-serif",
                  fontSize: 17,
                  color: "#4ade80",
                  fontWeight: 600,
                }}
              >
                {f.sub}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
