import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY_1;
if (!ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY_1 not set");
  process.exit(1);
}

console.log("Key length:", ELEVENLABS_API_KEY.length);
console.log("Key prefix:", ELEVENLABS_API_KEY.substring(0, 8));

// Rachel voice - warm friendly female
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

const SCENES = [
  { id: "scene1", text: "Hey there! I'm Cuddles, your smart AI budtender!" },
  { id: "scene2", text: "Choosing cannabis can be overwhelming. Too many strains, confusing effects, and bad recommendations." },
  { id: "scene3", text: "That's where I come in! I use AI to match you with the perfect strain, with ninety-five percent accuracy." },
  { id: "scene4", text: "Tell me what you need. I analyze over a thousand strains and give you your perfect match, instantly!" },
  { id: "scene5", text: "Try Cuddles AI for free! No signup needed. Visit cuddles ai dot com!" },
];

const outDir = path.resolve("public/voiceover");
fs.mkdirSync(outDir, { recursive: true });

for (const scene of SCENES) {
  console.log(`Generating: ${scene.id}...`);
  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: scene.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`Error for ${scene.id}: ${resp.status} - ${errText}`);
    process.exit(1);
  }

  const buf = Buffer.from(await resp.arrayBuffer());
  const outPath = path.join(outDir, `${scene.id}.mp3`);
  fs.writeFileSync(outPath, buf);
  console.log(`  Saved: ${outPath} (${buf.length} bytes)`);
}

console.log("All voiceovers generated!");
