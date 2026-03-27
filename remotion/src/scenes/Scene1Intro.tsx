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

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cuddles bounces in
  const cuddlesScale = spring({ frame, fps, config: { damping: 8, stiffness: 100 } });
  const cuddlesY = interpolate(cuddlesScale, [0, 1], [400, 0]);

  // Subtle float after landing
  const float = Math.sin(frame * 0.08) * 8;

  // "Hey there!" text
  const textOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textY = interpolate(frame, [25, 45], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Sparkle particles
  const sparkles = [
    { x: 200, y: 180, delay: 30, size: 16 },
    { x: 820, y: 220, delay: 40, size: 12 },
    { x: 150, y: 600, delay: 50, size: 14 },
    { x: 880, y: 550, delay: 35, size: 18 },
    { x: 500, y: 120, delay: 45, size: 10 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #1a0a2e 0%, #2d1b4e 40%, #3d1f3f 70%, #4a1942 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Animated gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          top: 100 + Math.sin(frame * 0.03) * 20,
          left: 50 + Math.cos(frame * 0.02) * 15,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
          bottom: 80 + Math.cos(frame * 0.04) * 15,
          right: 60 + Math.sin(frame * 0.03) * 10,
        }}
      />

      {/* Sparkles */}
      {sparkles.map((s, i) => {
        const sFrame = frame - s.delay;
        const sScale = sFrame > 0 ? spring({ frame: sFrame, fps, config: { damping: 6 } }) : 0;
        const sOpacity = interpolate(sFrame, [0, 10, 50, 60], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y + Math.sin((frame + i * 20) * 0.1) * 5,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.8)",
              transform: `scale(${sScale})`,
              opacity: sOpacity,
              boxShadow: "0 0 10px rgba(255,255,255,0.5)",
            }}
          />
        );
      })}

      {/* Cuddles character */}
      <Img
        src={staticFile("images/cuddles.png")}
        style={{
          width: 380,
          height: 380,
          objectFit: "contain",
          transform: `translateY(${cuddlesY + float + 40}px) scale(${cuddlesScale})`,
        }}
      />

      {/* Hey there text */}
      <div
        style={{
          position: "absolute",
          bottom: 130,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            textShadow: "0 4px 20px rgba(139,92,246,0.5)",
          }}
        >
          Hey there! I'm Cuddles 👋
        </div>
      </div>
    </AbsoluteFill>
  );
};
