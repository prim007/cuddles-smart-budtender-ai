import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  console.log("Key exists:", !!ELEVENLABS_API_KEY);
  console.log("Key length:", ELEVENLABS_API_KEY?.length);
  console.log("Key prefix:", ELEVENLABS_API_KEY?.substring(0, 6));

  if (!ELEVENLABS_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing ELEVENLABS_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { text, voiceId } = await req.json();
  const voice = voiceId || "EXAVITQu4vr4xnSDxMaL";

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`;
  console.log("Calling ElevenLabs URL:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.4,
        use_speaker_boost: true,
        speed: 1.0,
      },
    }),
  });

  console.log("ElevenLabs response status:", response.status);

  if (!response.ok) {
    const err = await response.text();
    console.error("ElevenLabs error:", err);
    return new Response(JSON.stringify({ error: err }), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const audioBuffer = await response.arrayBuffer();

  return new Response(audioBuffer, {
    headers: {
      ...corsHeaders,
      "Content-Type": "audio/mpeg",
    },
  });
});
