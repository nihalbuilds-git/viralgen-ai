import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import type { PromptPair } from "@/lib/prompts";

interface Props {
  prompt: PromptPair;
  brandVoice?: string | null;
}

export function PromptPreview({ prompt, brandVoice }: Props) {
  const [open, setOpen] = useState(false);
  const hasVoice = Boolean((brandVoice ?? "").trim());

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Code2 className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Preview the prompt</p>
            <p className="text-xs text-muted-foreground">
              {hasVoice ? (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Brand voice applied
                </span>
              ) : (
                "Add a brand voice in Profile to personalize"
              )}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border/60 p-4">
              <PromptBlock label="System" text={prompt.system} />
              <PromptBlock label="User" text={prompt.user} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromptBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
          {label}
        </span>
        <CopyButton text={text} />
      </div>
      <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-xs leading-relaxed">
        {text}
      </pre>
    </div>
  );
}

interface SkeletonProps {
  reason?: string;
}
export function PromptPreviewSkeleton({ reason }: SkeletonProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
      {reason ?? "Fill in the fields above to preview the prompt."}
    </div>
  );
}
