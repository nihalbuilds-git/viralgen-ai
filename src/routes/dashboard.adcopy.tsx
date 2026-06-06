import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateAdCopyFn } from "@/lib/ai.functions";
import { FavoriteButton } from "@/components/favorite-button";
import { CopyButton } from "@/components/copy-button";
import { ToolHeader } from "@/components/tool-header";
import { UpgradeModal } from "@/components/upgrade-modal";
import { getUsageLimitMessage } from "@/lib/usage-errors";

export const Route = createFileRoute("/dashboard/adcopy")({
  component: AdCopyTool,
});

function AdCopyTool() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [tone, setTone] = useState("persuasive");
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const qc = useQueryClient();

  const fn = useServerFn(generateAdCopyFn);
  const mutation = useMutation({
    mutationFn: (vars: { product: string; audience: string; offer: string; tone: string }) =>
      fn({ data: vars }),
    onError: (e: Error) => {
      const limitMessage = getUsageLimitMessage(e);
      if (limitMessage) setUpgradeReason(limitMessage);
      else toast.error(e.message || "Generation failed");
    },
    onSuccess: () => {
      toast.success("Ad copy ready");
      qc.invalidateQueries({ queryKey: ["generations"] });
      qc.invalidateQueries({ queryKey: ["usage"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const handle = () => {
    if (!product.trim() || !audience.trim() || !offer.trim()) {
      toast.error("Please fill in product, audience, and offer");
      return;
    }
    mutation.mutate({ product, audience, offer, tone });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ToolHeader
        icon={Megaphone}
        title="Ad Copy Generator"
        description="High-converting headlines and body copy for Meta, Google, and TikTok ads."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="gradient-border glass relative overflow-hidden rounded-2xl border-0 p-6 shadow-soft md:p-8">
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-gradient-primary opacity-15 blur-3xl" />
          <div className="relative space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product">Product / service</Label>
                <Input id="product" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. AI scheduling assistant" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target audience</Label>
                <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Busy startup founders" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer">Offer / promotion</Label>
              <Textarea
                id="offer"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="e.g. 14-day free trial, no credit card required"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handle}
              disabled={mutation.isPending}
              size="lg"
              className="btn-shine w-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] hover:opacity-95 sm:w-auto"
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {mutation.isPending ? "Generating…" : "Generate ad copy"}
            </Button>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {mutation.data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight">Results</h2>
              <FavoriteButton generationId={mutation.data.generationId} />
            </div>
            <ResultBlock index={0} label="Headline" value={mutation.data.headline} />
            <ResultBlock index={1} label="Primary text" value={mutation.data.primaryText} />
            <ResultBlock index={2} label="Call to action" value={mutation.data.cta} />
          </motion.div>
        )}
      </AnimatePresence>
      <UpgradeModal
        open={Boolean(upgradeReason)}
        onOpenChange={(open) => !open && setUpgradeReason(null)}
        reason={upgradeReason ?? undefined}
      />
    </div>
  );
}

function ResultBlock({ index, label, value }: { index: number; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card className="gradient-border hover-lift group rounded-2xl border-0 bg-card/60 p-5 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              {label}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
          </div>
          <div className="opacity-70 transition-opacity group-hover:opacity-100">
            <CopyButton text={value} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
