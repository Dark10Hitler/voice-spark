import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Language code mapping for Google TTS
const langMap: Record<string, string> = {
  en: "en", "en-us": "en", "en-gb": "en-GB",
  ru: "ru", es: "es", fr: "fr", de: "de", it: "it",
  pt: "pt", zh: "zh-CN", ja: "ja", ko: "ko",
  ar: "ar", hi: "hi", pl: "pl", uk: "uk", tr: "tr", nl: "nl",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, lang = "en" } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`TTS request: lang=${lang}, text length=${text.length}`);

    // Resolve language code
    const langLower = (lang || "en").toLowerCase().split("-")[0];
    const ttsLang = langMap[langLower] || langMap[lang.toLowerCase()] || "en";

    // Split text into chunks (Google TTS has ~200 char limit per request)
    const maxChunkSize = 200;
    const chunks: string[] = [];
    let remaining = text.trim();

    while (remaining.length > 0) {
      if (remaining.length <= maxChunkSize) {
        chunks.push(remaining);
        break;
      }

      // Find a good break point
      let breakPoint = remaining.lastIndexOf(". ", maxChunkSize);
      if (breakPoint === -1 || breakPoint < 50) {
        breakPoint = remaining.lastIndexOf(", ", maxChunkSize);
      }
      if (breakPoint === -1 || breakPoint < 50) {
        breakPoint = remaining.lastIndexOf(" ", maxChunkSize);
      }
      if (breakPoint === -1 || breakPoint < 50) {
        breakPoint = maxChunkSize;
      }

      chunks.push(remaining.slice(0, breakPoint + 1).trim());
      remaining = remaining.slice(breakPoint + 1).trim();
    }

    console.log(`Split into ${chunks.length} chunks`);

    // Fetch audio for each chunk
    const audioBuffers: ArrayBuffer[] = [];

    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodedText}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        console.error(`Google TTS error for chunk: ${response.status}`);
        throw new Error(`TTS generation failed: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      audioBuffers.push(buffer);
    }

    // Combine all audio buffers
    const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;

    for (const buf of audioBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    // Convert to base64
    const base64 = btoa(String.fromCharCode(...combined));

    console.log(`Generated audio: ${combined.length} bytes from ${chunks.length} chunks`);

    return new Response(
      JSON.stringify({
        audio: base64,
        contentType: "audio/mpeg",
        chunks: chunks.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("TTS Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate audio";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
