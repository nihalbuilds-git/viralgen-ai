import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
  onCta?: () => void;
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, ctaTo, onCta }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-gradient-card px-6 py-16 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 animate-glow rounded-full bg-gradient-primary blur-2xl opacity-30" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {ctaLabel && (ctaTo || onCta) && (
        <div className="mt-6">
          {ctaTo ? (
            <Button asChild className="bg-gradient-primary shadow-glow hover:opacity-90">
              <Link to={ctaTo}>{ctaLabel}</Link>
            </Button>
          ) : (
            <Button onClick={onCta} className="bg-gradient-primary shadow-glow hover:opacity-90">
              {ctaLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
