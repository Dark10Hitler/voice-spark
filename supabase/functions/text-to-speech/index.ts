import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, lang } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`TTS request: lang=${lang}, text length=${text.length}`);

    // Select model based on language
    let model = "facebook/mms-tts-eng"; // Default English
    
    if (lang) {
      const langLower = lang.toLowerCase();
      if (langLower.startsWith("ru")) {
        model = "facebook/mms-tts-rus";
      } else if (langLower.startsWith("es")) {
        model = "facebook/mms-tts-spa";
      } else if (langLower.startsWith("fr")) {
        model = "facebook/mms-tts-fra";
      } else if (langLower.startsWith("de")) {
        model = "facebook/mms-tts-deu";
      } else if (langLower.startsWith("it")) {
        model = "facebook/mms-tts-ita";
      } else if (langLower.startsWith("pt")) {
        model = "facebook/mms-tts-por";
      } else if (langLower.startsWith("zh")) {
        model = "facebook/mms-tts-cmn";
      } else if (langLower.startsWith("ja")) {
        model = "facebook/mms-tts-jpn";
      } else if (langLower.startsWith("ko")) {
        model = "facebook/mms-tts-kor";
      } else if (langLower.startsWith("ar")) {
        model = "facebook/mms-tts-ara";
      } else if (langLower.startsWith("hi")) {
        model = "facebook/mms-tts-hin";
      } else if (langLower.startsWith("pl")) {
        model = "facebook/mms-tts-pol";
      } else if (langLower.startsWith("uk")) {
        model = "facebook/mms-tts-ukr";
      } else if (langLower.startsWith("tr")) {
        model = "facebook/mms-tts-tur";
      } else if (langLower.startsWith("nl")) {
        model = "facebook/mms-tts-nld";
      }
    }

    console.log(`Using TTS model: ${model}`);

    // Use the new Hugging Face router endpoint
    const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API error:", response.status, errorText);
      throw new Error(`TTS API error: ${response.status}`);
    }

    // Get audio blob
    const audioBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log(`Generated audio: ${audioBuffer.byteLength} bytes`);

    return new Response(
      JSON.stringify({ 
        audio: base64,
        contentType: response.headers.get("content-type") || "audio/wav",
        model 
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
