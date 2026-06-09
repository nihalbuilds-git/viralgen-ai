import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  Wand2,
  MessageSquare,
  Megaphone,
  Package,
  ImageIcon,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateMyProfile } from "@/lib/profile.functions";

const STORAGE_KEY = "viralgen_onboarded_v1";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [voice, setVoice] = useState("");
  const qc = useQueryClient();
  const updateFn = useServerFn(updateMyProfile);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so the dashboard renders first
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  };

  const saveVoice = useMutation({
    mutationFn: () => updateFn({ data: { brand_voice: voice.trim() } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Brand voice saved");
      setStep(2);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleNext = () => {
    if (step === 1 && voice.trim().length > 0) {
      saveVoice.mutate();
      return;
    }
    if (step >= 2) {
      finish();
      return;
    }
    setStep(step + 1);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) finish();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Wand2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            {step === 0 && "Welcome to ViralGen ✨"}
            {step === 1 && "Teach the AI your brand voice"}
            {step === 2 && "Pick a tool to start"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 0 && "Three quick steps and you'll be shipping content."}
            {step === 1 &&
              "Optional but powerful — every generation gets tuned to this voice."}
            {step === 2 && "Each tool comes with sample prompts. One click to try."}
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <ul className="space-y-3 py-2">
            {[
              "Pick from sample prompts on every tool",
              "Save outputs to favorites and history",
              "Brand voice keeps results on-message",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}

        {step === 1 && (
          <div className="space-y-2 py-2">
            <Label htmlFor="voice">Your brand voice (optional)</Label>
            <Textarea
              id="voice"
              rows={4}
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              placeholder="e.g. Warm, witty, and direct. We avoid jargon and write like a smart friend."
            />
            <p className="text-xs text-muted-foreground">
              You can change this anytime in Settings.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              { to: "/dashboard/caption", icon: MessageSquare, label: "Captions" },
              { to: "/dashboard/adcopy", icon: Megaphone, label: "Ad Copy" },
              { to: "/dashboard/product", icon: Package, label: "Product" },
              { to: "/dashboard/image", icon: ImageIcon, label: "Images" },
            ].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                onClick={finish}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                  <t.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{t.label}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step < 2 && (
              <Button variant="ghost" size="sm" onClick={finish}>
                Skip
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              disabled={saveVoice.isPending}
              className="bg-gradient-primary shadow-glow hover:opacity-95"
            >
              {saveVoice.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              {step === 0 && "Get started"}
              {step === 1 && (voice.trim() ? "Save & continue" : "Skip this step")}
              {step === 2 && "Done"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
