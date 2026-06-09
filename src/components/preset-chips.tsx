import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props<T> {
  label?: string;
  presets: T[];
  onApply: (preset: T) => void;
  getLabel: (preset: T) => string;
}

export function PresetChips<T>({
  label = "Try a sample",
  presets,
  onApply,
  getLabel,
}: Props<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        {label}
      </span>
      {presets.map((p, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onApply(p)}
          className={cn(
            "rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs",
            "font-medium text-foreground/80 backdrop-blur transition-all",
            "hover:border-primary/50 hover:bg-accent hover:text-foreground",
          )}
        >
          {getLabel(p)}
        </button>
      ))}
    </div>
  );
}
