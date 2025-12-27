export type DetectedLanguage = {
  tag: string; // e.g. "en", "ru", "es"
  reason: string;
};

export function detectLanguage(text: string): DetectedLanguage {
  const t = text.trim();
  if (!t) return { tag: (navigator.language || "en").slice(0, 2), reason: "empty" };

  // Ukrainian markers
  if (/[іїєґІЇЄҐ]/.test(t)) return { tag: "uk", reason: "cyrillic-uk" };

  // Cyrillic
  if (/[\u0400-\u04FF]/.test(t)) return { tag: "ru", reason: "cyrillic" };

  // Hiragana / Katakana
  if (/[\u3040-\u30FF]/.test(t)) return { tag: "ja", reason: "kana" };

  // Hangul
  if (/[\uAC00-\uD7AF]/.test(t)) return { tag: "ko", reason: "hangul" };

  // CJK Unified Ideographs
  if (/[\u4E00-\u9FFF]/.test(t)) return { tag: "zh", reason: "han" };

  // Arabic
  if (/[\u0600-\u06FF]/.test(t)) return { tag: "ar", reason: "arabic" };

  // Devanagari
  if (/[\u0900-\u097F]/.test(t)) return { tag: "hi", reason: "devanagari" };

  // Basic Spanish/French/German heuristic by diacritics
  if (/[ñÑ]/.test(t)) return { tag: "es", reason: "spanish" };
  if (/[çÇœŒéèêëàâîïùû]/.test(t)) return { tag: "fr", reason: "french" };
  if (/[äöüßÄÖÜ]/.test(t)) return { tag: "de", reason: "german" };

  return { tag: "en", reason: "default" };
}

export function pickBestVoice(voices: SpeechSynthesisVoice[], langTag: string): SpeechSynthesisVoice | undefined {
  const tag = (langTag || "").toLowerCase();

  const candidates = voices
    .filter((v) => {
      const l = (v.lang || "").toLowerCase();
      return l === tag || l.startsWith(`${tag}-`);
    })
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));

  return candidates[0] ?? voices.sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = (v.name || "").toLowerCase();
  let s = 0;
  if (name.includes("google")) s += 8;
  if (name.includes("natural")) s += 6;
  if (name.includes("neural")) s += 4;
  if (v.default) s += 2;
  if (!v.localService) s += 1;
  return s;
}
