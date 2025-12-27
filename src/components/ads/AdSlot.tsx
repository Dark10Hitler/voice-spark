import { cn } from "@/lib/utils";

export function AdSlot({
  slotId,
  label = "Sponsored",
  sizeHint,
  className,
}: {
  slotId: "HEADER_LEADERBOARD" | "SIDEBAR_RECTANGLE" | "BOTTOM_RESPONSIVE";
  label?: string;
  sizeHint?: string;
  className?: string;
}) {
  return (
    <aside className={cn("w-full", className)} aria-label={`${label} ad slot ${slotId}`}>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
        {label} {sizeHint ? <span className="ml-2 tracking-normal">({sizeHint})</span> : null}
      </p>
      <div className="glass-card flex items-center justify-center rounded-xl px-4 py-6 text-xs text-muted-foreground">
        <div className="text-center">
          <p className="font-semibold text-foreground/80">AdSense Placeholder</p>
          <p className="mt-1">{slotId}</p>
        </div>
      </div>
    </aside>
  );
}
