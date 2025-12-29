/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Download, 
  Volume2, 
  Languages, 
  Gauge, 
  AudioWaveform,
  ChevronDown,
  Play,
  Pause,
  Square,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { PresetBar, type Preset } from "@/components/tts/PresetBar";
import { FileDropZone } from "@/components/tts/FileDropZone";
import { WaveVisualizer } from "@/components/tts/WaveVisualizer";
import { useSpeechEngine } from "@/components/tts/useSpeechEngine";

// Voice mapping: detected language -> edge-tts voice ID
const VOICE_MAP: Record<string, string> = {
  en: "en-US-ChristopherNeural",
  ru: "ru-RU-SvetlanaNeural",
  uk: "uk-UA-PolinaNeural",
  de: "de-DE-ConradNeural",
  fr: "fr-FR-DeniseNeural",
  es: "es-ES-ElviraNeural",
  it: "it-IT-ElsaNeural",
  pt: "pt-BR-FranciscaNeural",
  zh: "zh-CN-XiaoxiaoNeural",
  ja: "ja-JP-NanamiNeural",
  ko: "ko-KR-SunHiNeural",
  ar: "ar-SA-ZariyahNeural",
  hi: "hi-IN-SwaraNeural",
};

const BACKEND_URL = "https://back-z6i3.onrender.com";

type Effects = { radio: boolean; echo: boolean; crystal: boolean };

export function TtsStudio() {
  const [text, setText] = useState("");
  const [voiceURI, setVoiceURI] = useState<string | undefined>(undefined);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [effects, setEffects] = useState<Effects>({ radio: false, echo: false, crystal: false });
  const [activePreset, setActivePreset] = useState<Preset["id"] | null>(null);

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Generating audio...");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const cancelRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { voices, resolvedVoice, state, speak, pause, resume, stop, detectedLanguage } = useSpeechEngine(text, {
    voiceURI,
    rate,
    pitch,
    volume,
  });

  const pulse = useMemo(() => (state.highlight ? state.highlight.start : 0), [state.highlight]);

  useEffect(() => {
    if (!previewUrl) return;
    const el = audioElRef.current;
    if (!el) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      analyser.connect(ctx.destination);
    }

    if (!sourceNodeRef.current) {
      const src = ctx.createMediaElementSource(el);
      src.connect(analyserRef.current);
      sourceNodeRef.current = src;
    }
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

  const exportMp3 = async () => {
    if (!text.trim()) {
      toast.error("Please add some text first.");
      return;
    }

    cancelRef.current = false;
    setExporting(true);
    setProgress(10);
    setLoadingMessage("Generating audio...");

    try {
      stop();
      const voiceId = VOICE_MAP[detectedLanguage.tag] || VOICE_MAP.en;
      setProgress(20);

      const coldStartTimer = setTimeout(() => {
        setLoadingMessage("Server warming up...");
      }, 3000);

      const response = await fetch(`${BACKEND_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), voice: voiceId }),
      });

      clearTimeout(coldStartTimer);

      if (cancelRef.current) throw new Error("Export cancelled");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      setProgress(70);
      setLoadingMessage("Processing...");

      const mp3Blob = await response.blob();

      if (!mp3Blob || mp3Blob.size === 0) {
        throw new Error("No audio returned from server");
      }

      setProgress(100);

      if (cancelRef.current) throw new Error("Export cancelled");

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(mp3Blob);
      setPreviewUrl(url);

      const link = document.createElement("a");
      link.href = url;
      link.download = "voiceover.mp3";
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Audio generated and downloaded!");
    } catch (e: any) {
      if (!cancelRef.current) {
        toast.error(e?.message || "Export failed. Please try again.");
      }
    } finally {
      setExporting(false);
      setProgress(0);
      setLoadingMessage("Generating audio...");
    }
  };

  const cancelExport = () => {
    cancelRef.current = true;
    setExporting(false);
    setProgress(0);
    toast.message("Export cancelled.");
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-studio mx-auto">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient mb-3">
          Text to Speech Studio
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
          Transform your text into natural-sounding audio. Perfect for content creators.
        </p>
      </motion.header>

      {/* Main Writing Surface */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="writing-surface rounded-2xl overflow-hidden"
      >
        {/* Magic Toolbar */}
        <div className="magic-toolbar border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Voice Select */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="toolbar" className="gap-1.5">
                    <Volume2 size={14} />
                    <span className="hidden sm:inline">{resolvedVoice?.name?.split(' ')[0] || 'Voice'}</span>
                    <ChevronDown size={12} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="start">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Voice</Label>
                      <Select value={voiceURI ?? "auto"} onValueChange={(v) => setVoiceURI(v === "auto" ? undefined : v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Auto-select" />
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
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Detected: <span className="font-medium text-foreground">{detectedLanguage.tag.toUpperCase()}</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Speed Control */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="toolbar" className="gap-1.5">
                    <Gauge size={14} />
                    <span className="hidden sm:inline">{rate.toFixed(1)}x</span>
                    <ChevronDown size={12} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" align="start">
                  <Label className="text-xs text-muted-foreground mb-3 block">Speed: {rate.toFixed(2)}x</Label>
                  <Slider value={[rate]} min={0.5} max={2} step={0.1} onValueChange={(v) => setRate(v[0])} />
                </PopoverContent>
              </Popover>

              {/* Pitch Control */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="toolbar" className="gap-1.5">
                    <AudioWaveform size={14} />
                    <span className="hidden sm:inline">Pitch</span>
                    <ChevronDown size={12} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" align="start">
                  <Label className="text-xs text-muted-foreground mb-3 block">Pitch: {pitch.toFixed(2)}</Label>
                  <Slider value={[pitch]} min={0.5} max={1.5} step={0.05} onValueChange={(v) => setPitch(v[0])} />
                </PopoverContent>
              </Popover>

              {/* Language indicator */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 h-8">
                <Languages size={14} />
                <span>{detectedLanguage.tag.toUpperCase()}</span>
              </div>
            </div>

            {/* Preview Controls */}
            <div className="flex items-center gap-1">
              <Button 
                variant="toolbar" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => (state.isSpeaking ? pause() : speak())}
              >
                {state.isSpeaking ? <Pause size={14} /> : <Play size={14} />}
              </Button>
              <Button 
                variant="toolbar" 
                size="icon" 
                className="h-8 w-8"
                onClick={stop}
              >
                <Square size={12} />
              </Button>
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="p-6 md:p-8">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your script here..."
            className="premium-textarea w-full min-h-[240px] md:min-h-[300px]"
            aria-label="Text input for text to speech"
          />
          
          {/* Character count */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{charCount} characters</span>
              <span>{wordCount} words</span>
            </div>
            <FileDropZone onText={(t) => setText(t)} compact />
          </div>
        </div>
      </motion.div>

      {/* Presets */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <PresetBar
          activeId={activePreset}
          onPreset={(p) => {
            onPreset(p);
            toast.success(`${p.label} preset applied`);
          }}
        />
      </motion.div>

      {/* Generate CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <div className="glass-card-elevated rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-semibold mb-1">Ready to generate?</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered neural voices. No account required.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {exporting && (
                <Button variant="outline" size="sm" onClick={cancelExport}>
                  Cancel
                </Button>
              )}
              <Button
                variant="hero"
                size="lg"
                onClick={exportMp3}
                disabled={exporting || !text.trim()}
                className={exporting ? "animate-pulse-glow" : ""}
              >
                {exporting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {loadingMessage}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Audio
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <AnimatePresence>
            {exporting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div 
                    className="h-full bg-gradient-brand" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">{progress}%</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Audio Preview & Visualizer */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8"
          >
            <div className="glass-card-elevated rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Audio Preview</h3>
                <Button variant="outline" size="xs" asChild>
                  <a href={previewUrl} download="voiceover.mp3">
                    <Download size={14} />
                    Download
                  </a>
                </Button>
              </div>
              
              <WaveVisualizer 
                isActive={state.isSpeaking || exporting} 
                pulse={pulse} 
                analyser={previewUrl ? analyserRef.current : null} 
                className="h-20 mb-4"
              />
              
              <audio 
                ref={audioElRef} 
                controls 
                className="w-full h-10 rounded-lg" 
                src={previewUrl} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}