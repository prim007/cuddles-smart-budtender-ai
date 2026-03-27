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

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const problems = [
    { icon: "😵‍💫", text: "Too many strains to choose from", delay: 10 },
    { icon: "❓", text: "Not sure what effects you'll get", delay: 30 },
    { icon: "😤", text: "Tired of bad recommendations", delay: 50 },
  ];

  // Title
  const titleScale = spring({ frame, fps, config: { damping: 15, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Cuddles peeks from side
  const cuddlesX = interpolate(frame, [0, 20], [200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cuddlesOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const float = Math.sin(frame * 0.08) * 5;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1a0a2e 0%, #2d1040 50%, #3d1f3f 100%)",
        padding: 60,
      }}
    >
      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          top: -100,
          right: -100,
        }}
      />

      {/* Cuddles on the right */}
      <Img
        src={staticFile("images/cuddles.png")}
        style={{
          position: "absolute",
          right: 40,
          bottom: 80 + float,
          width: 220,
          height: 220,
          objectFit: "contain",
          opacity: cuddlesOpacity,
          transform: `translateX(${cuddlesX}px)`,
        }}
      />

      {/* Title */}
      <div
        style={{
          marginTop: 80,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 52,
            fontWeight: 800,
            color: "white",
            marginBottom: 60,
            lineHeight: 1.2,
          }}
        >
          Choosing cannabis{"\n"}shouldn't be hard...
        </div>
      </div>

      {/* Problem cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 700 }}>
        {problems.map((p, i) => {
          const pFrame = frame - p.delay;
          const pScale = pFrame > 0 ? spring({ frame: pFrame, fps, config: { damping: 12 } }) : 0;
          const pX = interpolate(pScale, [0, 1], [-80, 0]);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "20px 28px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                transform: `translateX(${pX}px) scale(${pScale})`,
                opacity: pScale,
              }}
            >
              <span style={{ fontSize: 40 }}>{p.icon}</span>
              <span
                style={{
                  fontFamily: "sans-serif",
                  fontSize: 30,
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 600,
                }}
              >
                {p.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
