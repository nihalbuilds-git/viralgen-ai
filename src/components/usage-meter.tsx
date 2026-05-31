import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface Props {
  label: string;
  used: number;
  limit: number; // -1 for unlimited
  hint?: string;
}

export function UsageMeter({ label, used, limit, hint }: Props) {
  const unlimited = limit < 0;
  const pct = unlimited ? 12 : Math.min(100, Math.round((used / limit) * 100));
  const danger = !unlimited && pct >= 90;
  const warn = !unlimited && pct >= 70 && pct < 90;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{label}</span>
          {hint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>{hint}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-muted-foreground">
          {used.toLocaleString()} / {unlimited ? "∞" : limit.toLocaleString()}
        </span>
      </div>
      <Progress
        value={pct}
        className={`h-2 ${danger ? "[&>div]:bg-destructive" : warn ? "[&>div]:bg-amber-500" : ""}`}
      />
    </div>
  );
}
