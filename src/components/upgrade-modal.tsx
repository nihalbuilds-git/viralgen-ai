import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PLAN_BY_ID } from "@/lib/plans";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reason?: string;
}

export function UpgradeModal({ open, onOpenChange, reason }: Props) {
  const pro = PLAN_BY_ID.pro;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-center">
            {reason ?? "You've reached your plan's limit for this month."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-border/60 bg-accent/40 p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-xl font-bold">{pro.name}</span>
            <span className="font-display text-2xl font-bold">
              {pro.price}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {pro.features.filter((f) => f.included).slice(0, 4).map((f) => (
              <li key={f.label} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button asChild className="bg-gradient-primary shadow-glow hover:opacity-90">
            <Link
              to="/pricing"
              onClick={() => {
                // Best-effort funnel tracking — never blocks navigation.
                try {
                  void fetch("/_serverFn/src_lib_events_functions_ts--trackEvent_createServerFn_handler", {
                    method: "POST",
                  });
                } catch {
                  // ignore
                }
                onOpenChange(false);
              }}
            >
              Upgrade now
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
