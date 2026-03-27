import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Problem } from "./scenes/Scene2Problem";
import { Scene3Solution } from "./scenes/Scene3Solution";
import { Scene4HowItWorks } from "./scenes/Scene4HowItWorks";
import { Scene5CTA } from "./scenes/Scene5CTA";

// Scene durations based on voiceover lengths (at 30fps) + small buffer
const SCENE1_DUR = 140;  // ~4.3s audio + buffer
const SCENE2_DUR = 250;  // ~7.8s audio + buffer
const SCENE3_DUR = 240;  // ~7.6s audio + buffer
const SCENE4_DUR = 230;  // ~7.3s audio + buffer
const SCENE5_DUR = 200;  // ~6.3s audio + buffer
const TRANSITION_DUR = 20;

export const MainVideo: React.FC = () => {
  // Calculate audio start frames accounting for transitions
  const audio1Start = 0;
  const audio2Start = SCENE1_DUR - TRANSITION_DUR;
  const audio3Start = audio2Start + SCENE2_DUR - TRANSITION_DUR;
  const audio4Start = audio3Start + SCENE3_DUR - TRANSITION_DUR;
  const audio5Start = audio4Start + SCENE4_DUR - TRANSITION_DUR;

  return (
    <AbsoluteFill>
      {/* Voiceover audio tracks */}
      <Sequence from={audio1Start + 10}>
        <Audio src={staticFile("voiceover/scene1.mp3")} volume={1} />
      </Sequence>
      <Sequence from={audio2Start + 10}>
        <Audio src={staticFile("voiceover/scene2.mp3")} volume={1} />
      </Sequence>
      <Sequence from={audio3Start + 10}>
        <Audio src={staticFile("voiceover/scene3.mp3")} volume={1} />
      </Sequence>
      <Sequence from={audio4Start + 10}>
        <Audio src={staticFile("voiceover/scene4.mp3")} volume={1} />
      </Sequence>
      <Sequence from={audio5Start + 10}>
        <Audio src={staticFile("voiceover/scene5.mp3")} volume={1} />
      </Sequence>

      {/* Visual scenes */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE1_DUR}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DUR })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE2_DUR}>
          <Scene2Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DUR })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE3_DUR}>
          <Scene3Solution />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DUR })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE4_DUR}>
          <Scene4HowItWorks />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DUR })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENE5_DUR}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
