import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUsageLimitMessage } from "@/lib/usage-errors";

interface Props {
  error: Error | null;
  onRetry: () => void;
  onUpgrade?: () => void;
  isRetrying?: boolean;
}

export function GenerationError({ error, onRetry, onUpgrade, isRetrying }: Props) {
  if (!error) return null;
  const limit = getUsageLimitMessage(error);
  const isLimit = Boolean(limit);
  const title = isLimit ? "You've hit your plan limit" : "Generation failed";
  const message = isLimit
    ? limit
    : error.message?.replace(/^Error:\s*/i, "") ||
      "Something went wrong on our side. Please try again.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="alert"
      className="gradient-border relative overflow-hidden rounded-2xl border-0 bg-destructive/5 p-5 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {isLimit && onUpgrade ? (
              <Button
                onClick={onUpgrade}
                size="sm"
                className="bg-gradient-primary shadow-glow hover:opacity-95"
              >
                <Crown className="mr-1.5 h-3.5 w-3.5" />
                Upgrade plan
              </Button>
            ) : (
              <Button
                onClick={onRetry}
                size="sm"
                disabled={isRetrying}
                className="bg-gradient-primary shadow-glow hover:opacity-95"
              >
                <RefreshCcw
                  className={`mr-1.5 h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`}
                />
                {isRetrying ? "Retrying…" : "Try again"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
