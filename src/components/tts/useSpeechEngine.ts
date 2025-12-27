import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chunkText, type TextChunk } from "@/components/tts/split";
import { detectLanguage, pickBestVoice } from "@/components/tts/language";

export type SpeechState = {
  isSpeaking: boolean;
  isPaused: boolean;
  highlight: { start: number; end: number } | null;
  activeChunkIndex: number;
};

export type SpeechSettings = {
  voiceURI?: string;
  rate: number;
  pitch: number;
  volume: number;
};

export function useSpeechEngine(text: string, settings: SpeechSettings) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [state, setState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    highlight: null,
    activeChunkIndex: 0,
  });

  const chunks = useMemo<TextChunk[]>(() => chunkText(text), [text]);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunkIndexRef = useRef(0);
  const keepAliveRef = useRef<number | null>(null);

  const refreshVoices = useCallback(() => {
    const list = window.speechSynthesis.getVoices();
    setVoices(list);
  }, []);

  useEffect(() => {
    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [refreshVoices]);

  const resolvedVoice = useMemo(() => {
    const preferred = settings.voiceURI ? voices.find((v) => v.voiceURI === settings.voiceURI) : undefined;
    if (preferred) return preferred;

    const lang = detectLanguage(text).tag;
    return pickBestVoice(voices, lang);
  }, [voices, settings.voiceURI, text]);

  const stop = useCallback(() => {
    if (keepAliveRef.current) window.clearInterval(keepAliveRef.current);
    keepAliveRef.current = null;

    synthRef.current.cancel();
    utteranceRef.current = null;
    chunkIndexRef.current = 0;

    setState({ isSpeaking: false, isPaused: false, highlight: null, activeChunkIndex: 0 });
  }, []);

  const pause = useCallback(() => {
    if (!synthRef.current.speaking) return;
    synthRef.current.pause();
    setState((s) => ({ ...s, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    if (!synthRef.current.paused) return;
    synthRef.current.resume();
    setState((s) => ({ ...s, isPaused: false }));
  }, []);

  const speakNext = useCallback(() => {
    const idx = chunkIndexRef.current;
    const chunk = chunks[idx];
    if (!chunk) {
      stop();
      return;
    }

    const u = new SpeechSynthesisUtterance(chunk.text);
    utteranceRef.current = u; // keep-alive for long texts

    const detected = detectLanguage(text);
    u.lang = resolvedVoice?.lang || detected.tag;
    u.rate = settings.rate;
    u.pitch = settings.pitch;
    u.volume = settings.volume;

    if (resolvedVoice) u.voice = resolvedVoice;

    u.onstart = () => {
      setState((s) => ({ ...s, isSpeaking: true, isPaused: false, activeChunkIndex: idx }));
    };

    u.onboundary = (ev) => {
      // Chrome provides word boundaries; others may not.
      const rel = (ev as SpeechSynthesisEvent).charIndex ?? 0;
      const absStart = chunk.start + rel;
      const absEnd = findWordEnd(text, absStart);
      setState((s) => ({ ...s, highlight: { start: absStart, end: absEnd } }));
    };

    u.onend = () => {
      chunkIndexRef.current += 1;
      setState((s) => ({ ...s, highlight: null }));
      speakNext();
    };

    u.onerror = () => {
      stop();
    };

    synthRef.current.speak(u);
  }, [chunks, resolvedVoice, settings.pitch, settings.rate, settings.volume, stop, text]);

  const speak = useCallback(() => {
    stop();

    if (!chunks.length) return;

    chunkIndexRef.current = 0;
    setState((s) => ({ ...s, isSpeaking: true, isPaused: false, activeChunkIndex: 0 }));

    // Keep-alive hack for Chrome long speech
    keepAliveRef.current = window.setInterval(() => {
      try {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      } catch {
        // ignore
      }
    }, 5000);

    speakNext();
  }, [chunks.length, speakNext, stop]);

  useEffect(() => stop, [stop]);

  return {
    voices,
    resolvedVoice,
    chunks,
    state,
    speak,
    pause,
    resume,
    stop,
    detectedLanguage: detectLanguage(text),
  };
}

function findWordEnd(fullText: string, start: number) {
  let i = start;
  while (i < fullText.length && !/\s/.test(fullText[i])) {
    // Break at hard punctuation to make highlight feel snappy
    if (/[.,!?;:]/.test(fullText[i]) && i > start) break;
    i++;
  }
  return i;
}
