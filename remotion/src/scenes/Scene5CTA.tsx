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

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cuddles entrance
  const cuddlesScale = spring({ frame, fps, config: { damping: 8, stiffness: 80 } });
  const float = Math.sin(frame * 0.07) * 12;

  // Title
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleScale = spring({ frame: frame - 10, fps, config: { damping: 15 } });

  // CTA button pulse
  const ctaFrame = frame - 50;
  const ctaScale = ctaFrame > 0 ? spring({ frame: ctaFrame, fps, config: { damping: 10 } }) : 0;
  const ctaPulse = 1 + Math.sin(frame * 0.12) * 0.03;

  // Particle burst
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    delay: 20 + i * 3,
    size: 6 + Math.random() * 8,
  }));

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1a0a2e 0%, #2d1b4e 30%, #4a1942 60%, #3d1f3f 100%)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Big glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 40%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Particle burst */}
      {particles.map((p, i) => {
        const pFrame = frame - p.delay;
        const dist = pFrame > 0 ? interpolate(pFrame, [0, 40], [0, 300], { extrapolateRight: "clamp" }) : 0;
        const pOpacity = pFrame > 0 ? interpolate(pFrame, [0, 10, 30, 40], [0, 1, 1, 0], { extrapolateRight: "clamp" }) : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(p.angle) * dist,
              top: 320 + Math.sin(p.angle) * dist,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#8b5cf6" : "#ec4899",
              opacity: pOpacity,
              boxShadow: `0 0 12px ${i % 2 === 0 ? "rgba(139,92,246,0.6)" : "rgba(236,72,153,0.6)"}`,
            }}
          />
        );
      })}

      {/* Cuddles */}
      <Img
        src={staticFile("images/cuddles.png")}
        style={{
          width: 320,
          height: 320,
          objectFit: "contain",
          transform: `scale(${cuddlesScale}) translateY(${float}px)`,
          marginBottom: 20,
        }}
      />

      {/* Title */}
      <div
        style={{
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${Math.max(0, titleScale)})`,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.2,
            textShadow: "0 4px 30px rgba(139,92,246,0.4)",
          }}
        >
          Try Cuddles AI
        </div>
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 30,
            color: "rgba(255,255,255,0.7)",
            marginTop: 12,
            fontWeight: 500,
          }}
        >
          100% Free · No Signup Required
        </div>
      </div>

      {/* CTA button */}
      <div
        style={{
          marginTop: 40,
          padding: "20px 60px",
          borderRadius: 60,
          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          fontFamily: "sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: "white",
          transform: `scale(${ctaScale * ctaPulse})`,
          opacity: ctaScale,
          boxShadow: "0 8px 40px rgba(139,92,246,0.4)",
        }}
      >
        🌿 Start Chatting Now
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          fontFamily: "sans-serif",
          fontSize: 18,
          color: "rgba(255,255,255,0.4)",
          opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        cuddles-smart-budtender-ai.lovable.app
      </div>
    </AbsoluteFill>
  );
};
