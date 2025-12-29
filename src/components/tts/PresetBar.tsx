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
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Presets:</span>
      {PRESETS.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant={activeId === p.id ? "default" : "outline"}
          size="sm"
          onClick={() => onPreset(p)}
          className="rounded-full"
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
