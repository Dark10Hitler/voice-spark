/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Download, Wand2, AudioLines } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PresetBar, type Preset } from "@/components/tts/PresetBar";
import { FileDropZone } from "@/components/tts/FileDropZone";
import { WaveVisualizer } from "@/components/tts/WaveVisualizer";
import { useSpeechEngine } from "@/components/tts/useSpeechEngine";
import { chunkText } from "@/components/tts/split";
import { AdSlot } from "@/components/ads/AdSlot";

import { applyOfflineEffects, encodeMp3FromAudioBuffer } from "@/lib/audio/export";

type Effects = { radio: boolean; echo: boolean; crystal: boolean };

export function TtsStudio() {
  const [text, setText] = useState(
    "Write your script here…\n\nTip: paste your YouTube Shorts hook, then choose a mood preset and hit Play.",
  );

  const [voiceURI, setVoiceURI] = useState<string | undefined>(undefined);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [effects, setEffects] = useState<Effects>({ radio: false, echo: false, crystal: false });
  const [activePreset, setActivePreset] = useState<Preset["id"] | null>(null);

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef(false);

  const { voices, resolvedVoice, state, speak, pause, resume, stop, detectedLanguage } = useSpeechEngine(text, {
    voiceURI,
    rate,
    pitch,
    volume,
  });

  const pulse = useMemo(() => (state.highlight ? state.highlight.start : 0), [state.highlight]);

  const highlightedMarkup = useMemo(() => {
    const h = state.highlight;
    if (!h) return text;
    const start = Math.max(0, h.start);
    const end = Math.min(text.length, h.end);
    return `${text.slice(0, start)}[[H]]${text.slice(start, end)}[[/H]]${text.slice(end)}`;
  }, [state.highlight, text]);

  useEffect(() => {
    if (!previewUrl) return;
    const el = audioElRef.current;
    if (!el) return;

    // create analyser for the preview element
    const ctx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = ctx;

    const analyser = analyserRef.current ?? ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const src = ctx.createMediaElementSource(el);
    src.connect(analyser);
    analyser.connect(ctx.destination);

    return () => {
      try {
        src.disconnect();
      } catch {
        // ignore
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      stop();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (audioCtxRef.current) void audioCtxRef.current.close();
    };
  }, [previewUrl, stop]);

  const onPreset = (p: Preset) => {
    setActivePreset(p.id);
    setPitch(p.pitch);
    setRate(p.rate);
    setVolume(p.volume);
    setEffects(p.effects);
  };

  const canExport = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getDisplayMedia;

  const exportMp3 = async () => {
    if (!text.trim()) {
      toast.error("Please add some text first.");
      return;
    }

    // IMPORTANT: There is no universal way to route `speechSynthesis` output into Web Audio without tab/system capture.
    if (!canExport) {
      toast.error("MP3 export isn’t supported in this browser. Try Chrome on desktop.");
      return;
    }

    // Browser policy: export must start from a direct click.
    cancelRef.current = false;
    setExporting(true);
    setProgress(1);

    try {
      stop();

      // User gesture activation for Web Audio
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      // Ask user to share the current tab with audio.
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        stream.getTracks().forEach((t) => t.stop());
        toast.error("MP3 export needs tab audio. Select 'This tab' and enable 'Share tab audio'.");
        return;
      }

      const mimeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
      ];
      const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 192000,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const estimateMs = Math.max(4000, Math.min(120000, Math.floor(text.length * 55)));
      const startedAt = performance.now();

      const tick = () => {
        if (!exporting) return;
        const elapsed = performance.now() - startedAt;
        const pct = Math.min(95, Math.max(1, Math.floor((elapsed / estimateMs) * 95)));
        setProgress(pct);
        if (pct < 95) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      const recordAndSpeak = async () => {
        // Force safe export settings
        const exportRate = 1;
        const exportVolume = 1;

        const utterances = buildUtterances(text, {
          voice: resolvedVoice ?? undefined,
          pitch,
          rate: exportRate,
          volume: exportVolume,
          lang: detectedLanguage.tag,
          onChunkBoundaryAbs: () => {
            // Just a pulse for the UI
          },
        });

        let idx = 0;
        const speakOne = () => {
          if (cancelRef.current) return;
          const u = utterances[idx];
          if (!u) return;

          u.onstart = () => {
            if (recorder.state === "inactive") recorder.start(250);
          };

          u.onend = () => {
            idx += 1;
            if (idx < utterances.length) {
              window.speechSynthesis.speak(utterances[idx]);
              return;
            }

            // Explicit stop logic + buffer flush
            if (recorder.state !== "inactive") recorder.stop();
            window.setTimeout(() => {
              stream.getTracks().forEach((t) => t.stop());
            }, 300);
          };

          u.onerror = () => {
            if (recorder.state !== "inactive") recorder.stop();
            stream.getTracks().forEach((t) => t.stop());
          };

          window.speechSynthesis.speak(u);
        };

        speakOne();
      };

      const resultBlob: Blob = await new Promise((resolve, reject) => {
        recorder.onstop = async () => {
          try {
            if (cancelRef.current) return reject(new Error("Export cancelled"));

            setProgress(95);

            const webm = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
            const rawBuffer = await webm.arrayBuffer();

            const ctx = audioCtxRef.current ?? new AudioContext();
            audioCtxRef.current = ctx;

            if (ctx.state === "suspended") await ctx.resume();

            const decoded = await ctx.decodeAudioData(rawBuffer.slice(0));
            const processed = await applyOfflineEffects(decoded, effects);

            const mp3 = await encodeMp3FromAudioBuffer(processed, 192);

            setProgress(100);
            resolve(mp3);
          } catch (e: any) {
            reject(e);
          }
        };

        void recordAndSpeak().catch(reject);
      });

      if (cancelRef.current) throw new Error("Export cancelled");

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(resultBlob);
      setPreviewUrl(url);

      // Auto-download after preview is ready
      const link = document.createElement("a");
      link.href = url;
      link.download = `audio-speech-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("MP3 export started. Preview is ready below.");
    } catch (e: any) {
      toast.error(e?.message || "Export failed. Please try again.");
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  const cancelExport = () => {
    cancelRef.current = true;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    setExporting(false);
    setProgress(0);
    toast.message("Export cancelled.");
  };

  return (
    <section aria-label="Text to speech studio" className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={
          "glass-card glow-soft rounded-3xl p-5 md:p-7 " +
          (state.isSpeaking ? "ring-glow motion-safe:animate-breath" : "")
        }
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              <span className="text-gradient">Premium Voice Studio</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Free Text to Speech for TikTok creators with natural voices, word highlighting, and MP3 export — no
              registration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="hero" onClick={() => (state.isSpeaking ? pause() : speak())}>
              {state.isSpeaking ? (
                <>
                  <Pause size={18} strokeWidth={1.5} /> Pause
                </>
              ) : (
                <>
                  <Play size={18} strokeWidth={1.5} /> Play
                </>
              )}
            </Button>
            <Button type="button" variant="premium" onClick={resume} disabled={!state.isPaused}>
              <AudioLines size={18} strokeWidth={1.5} /> Resume
            </Button>
            <Button type="button" variant="premium" onClick={stop}>
              <Square size={18} strokeWidth={1.5} /> Stop
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[180px] rounded-2xl"
            aria-label="Text input for text to speech"
          />

          <WaveVisualizer isActive={state.isSpeaking || exporting} pulse={pulse} analyser={previewUrl ? analyserRef.current : null} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Voice</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Auto language: <span className="font-medium">{detectedLanguage.tag}</span>
                  </p>
                </div>
                <Wand2 size={18} strokeWidth={1.5} className="text-muted-foreground" />
              </div>

              <div className="mt-3">
                <Select value={voiceURI ?? "auto"} onValueChange={(v) => setVoiceURI(v === "auto" ? undefined : v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Auto-select best voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (best match)</SelectItem>
                    {voices.map((v) => (
                      <SelectItem key={v.voiceURI} value={v.voiceURI}>
                        {v.name} — {v.lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="mt-2 text-xs text-muted-foreground">
                  Selected: <span className="font-medium">{resolvedVoice?.name ?? "—"}</span>
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <p className="text-sm font-semibold">Export</p>
              <p className="mt-1 text-sm text-muted-foreground">
                MP3 export is 100% local. Due to browser limitations, it captures this tab’s audio (you’ll be prompted).
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button type="button" variant="hero" onClick={exportMp3} disabled={exporting}>
                  <Download size={18} strokeWidth={1.5} /> Download MP3
                </Button>
                {exporting ? (
                  <Button type="button" variant="premium" onClick={cancelExport}>
                    Cancel
                  </Button>
                ) : null}
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">MP3</span>
              </div>

              <AnimatePresence>
                {exporting ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="mt-4"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Processing & downloading…</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/50">
                      <div className="h-full bg-gradient-brand" style={{ width: `${progress}%` }} />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {previewUrl ? (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Preview</p>
                  <audio ref={audioElRef} controls className="mt-2 w-full" src={previewUrl} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <section className="glass-card rounded-2xl p-4 md:col-span-2" aria-label="Voice tuning">
              <h3 className="text-sm font-semibold">Fine-tune</h3>

              <div className="mt-4 grid gap-4">
                <SliderRow label="Rate" value={rate} min={0.6} max={1.4} step={0.05} onValue={setRate} />
                <SliderRow label="Pitch" value={pitch} min={0.5} max={1.5} step={0.05} onValue={setPitch} />
                <SliderRow label="Volume" value={volume} min={0.2} max={1} step={0.05} onValue={setVolume} />
              </div>
            </section>

            <section className="glass-card rounded-2xl p-4" aria-label="Effects">
              <h3 className="text-sm font-semibold">Effects</h3>
              <p className="mt-1 text-sm text-muted-foreground">Applied to exported MP3 + preview.</p>

              <div className="mt-4 space-y-3">
                <ToggleRow
                  label="Radio"
                  description="High-pass + subtle distortion"
                  checked={effects.radio}
                  onCheckedChange={(v) => setEffects((e) => ({ ...e, radio: v }))}
                />
                <ToggleRow
                  label="Echo"
                  description="Delay with feedback"
                  checked={effects.echo}
                  onCheckedChange={(v) => setEffects((e) => ({ ...e, echo: v }))}
                />
                <ToggleRow
                  label="Crystal Clear"
                  description="Compressor + clarity boost"
                  checked={effects.crystal}
                  onCheckedChange={(v) => setEffects((e) => ({ ...e, crystal: v }))}
                />
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PresetBar
              activeId={activePreset}
              onPreset={(p) => {
                onPreset(p);
                toast.success(`${p.label} preset applied.`);
              }}
            />
            <FileDropZone onText={(t) => setText(t)} />
          </div>

          <section className="glass-card rounded-2xl p-4" aria-label="Live transcript highlighting">
            <h3 className="text-sm font-semibold">Word-by-word highlighting</h3>
            <p className="mt-1 text-sm text-muted-foreground">This preview highlights boundaries during live playback.</p>

            <div className="mt-3 rounded-xl bg-background/40 p-4 text-sm leading-relaxed">
              {renderHighlight(highlightedMarkup)}
            </div>
          </section>

          <AdSlot slotId="BOTTOM_RESPONSIVE" label="Sponsored" className="pt-2" />
        </div>
      </motion.article>

      <aside className="space-y-6">
        <AdSlot slotId="SIDEBAR_RECTANGLE" label="Sponsored" sizeHint="300×600" />

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold">Export checklist</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Click “Download MP3”.</li>
            <li>In the browser prompt, choose “This tab”.</li>
            <li>Turn on “Share tab audio” (otherwise export will be silent).</li>
            <li>Keep this tab focused until export finishes.</li>
          </ol>
        </div>
      </aside>
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValue: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-xs font-medium text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onValue(v[0] ?? value)}
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function renderHighlight(markup: string) {
  const parts: Array<{ t: string; h: boolean }> = [];
  let rest = markup;

  while (rest.includes("[[H]]")) {
    const a = rest.indexOf("[[H]]");
    const b = rest.indexOf("[[/H]]");
    if (a === -1 || b === -1) break;

    const before = rest.slice(0, a);
    const mid = rest.slice(a + 5, b);
    parts.push({ t: before, h: false });
    parts.push({ t: mid, h: true });
    rest = rest.slice(b + 6);
  }
  parts.push({ t: rest, h: false });

  return (
    <p>
      {parts.map((p, i) =>
        p.h ? (
          <mark key={i} className="rounded bg-brand/20 px-1 text-foreground">
            {p.t}
          </mark>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </p>
  );
}

function buildUtterances(
  fullText: string,
  opts: {
    voice?: SpeechSynthesisVoice;
    lang: string;
    rate: number;
    pitch: number;
    volume: number;
    onChunkBoundaryAbs: (absCharIndex: number) => void;
  },
) {
  // Use the same chunking logic as playback; keep utterances referenced to avoid GC.
  const chunks = chunkText(fullText);

  return chunks.map((c) => {
    const u = new SpeechSynthesisUtterance(c.text);
    u.lang = opts.voice?.lang || opts.lang;
    u.rate = opts.rate;
    u.pitch = opts.pitch;
    u.volume = opts.volume;
    if (opts.voice) u.voice = opts.voice;

    u.onboundary = (ev: any) => {
      const rel = ev?.charIndex ?? 0;
      opts.onChunkBoundaryAbs(c.start + rel);
    };

    return u;
  });
}
