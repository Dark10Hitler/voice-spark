import { Button } from "@/components/ui/button";

export type Preset = {
  id: "horror" | "advertisement" | "meditation";
  label: string;
  pitch: number;
  rate: number;
  volume: number;
  effects: { radio: boolean; echo: boolean; crystal: boolean };
};

const PRESETS: Preset[] = [
  {
    id: "horror",
    label: "Horror",
    pitch: 0.5,
    rate: 0.8,
    volume: 1,
    effects: { radio: false, echo: true, crystal: false },
  },
  {
    id: "advertisement",
    label: "Advertisement",
    pitch: 1.1,
    rate: 1.2,
    volume: 1,
    effects: { radio: false, echo: false, crystal: true },
  },
  {
    id: "meditation",
    label: "Meditation",
    pitch: 0.8,
    rate: 0.7,
    volume: 0.85,
    effects: { radio: false, echo: false, crystal: false },
  },
];

export function PresetBar({
  onPreset,
  activeId,
}: {
  onPreset: (p: Preset) => void;
  activeId?: Preset["id"] | null;
}) {
  return (
    <section aria-label="Voice presets" className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Moods</h2>
          <p className="mt-1 text-sm text-muted-foreground">One tap sets pitch/rate/effects instantly.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant={activeId === p.id ? "hero" : "premium"}
            size="sm"
            onClick={() => onPreset(p)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
