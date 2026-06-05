import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  eyebrow?: string;
}

export function ToolHeader({ icon: Icon, title, description, eyebrow = "AI Studio" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-start gap-5"
    >
      <div className="relative">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-primary opacity-40 blur-xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow ring-1 ring-white/20">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
      <div className="space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow" />
          {eyebrow}
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          <span className="text-aurora">{title}</span>
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
    </motion.div>
  );
}
