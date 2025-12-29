import { useCallback, useRef, useState } from "react";
import mammoth from "mammoth";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function FileDropZone({
  onText,
  className,
  compact = false,
}: {
  onText: (text: string) => void;
  className?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  const readFile = useCallback(
    async (file: File) => {
      try {
        const ext = file.name.toLowerCase().split(".").pop();
        if (ext === "txt") {
          const text = await file.text();
          onText(text);
          toast.success("Imported .txt into the editor.");
          return;
        }

        if (ext === "docx") {
          const buf = await file.arrayBuffer();
          const res = await mammoth.extractRawText({ arrayBuffer: buf });
          onText(res.value);
          toast.success("Imported .docx into the editor.");
          return;
        }

        toast.error("Unsupported file. Please upload a .txt or .docx file.");
      } catch (e) {
        toast.error("Could not read the file. Try another document.");
      }
    },
    [onText],
  );

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Upload size={14} />
          Import file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) void readFile(file);
            e.currentTarget.value = "";
          }}
        />
      </>
    );
  }

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-4 transition-[transform,box-shadow] duration-200",
        isOver ? "ring-glow" : "",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void readFile(file);
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight">Import script</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag & drop a <span className="font-medium">.txt</span> or <span className="font-medium">.docx</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Upload size={18} strokeWidth={1.5} />
          Browse
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".txt,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) void readFile(file);
            e.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}
