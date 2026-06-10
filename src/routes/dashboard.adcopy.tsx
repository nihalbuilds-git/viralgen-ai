import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { ShareButton } from "@/components/share-button";
import { CopyButton } from "@/components/copy-button";
import { ToolHeader } from "@/components/tool-header";
import { UpgradeModal } from "@/components/upgrade-modal";
import { GenerationError } from "@/components/generation-error";
import { PromptPreview, PromptPreviewSkeleton } from "@/components/prompt-preview";
import { PresetChips } from "@/components/preset-chips";
import { BrandProfileSelect } from "@/components/brand-profile-select";
import { ADCOPY_PRESETS, type AdCopyPreset } from "@/lib/presets";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/profile.functions";
import { listBrandProfiles } from "@/lib/brand-profiles.functions";
import { buildAdCopyPrompt } from "@/lib/prompts";
import { getUsageLimitMessage } from "@/lib/usage-errors";

export const Route = createFileRoute("/dashboard/adcopy")({
  head: () => ({
    meta: [
      { title: "Ad Copy Generator — ViralGen AI" },
      { name: "description", content: "High-converting ad headlines and body copy for Meta, Google, and TikTok ads." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdCopyTool,
});

function AdCopyTool() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [tone, setTone] = useState("persuasive");
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("product")) setProduct(p.get("product")!);
    if (p.get("audience")) setAudience(p.get("audience")!);
    if (p.get("offer")) setOffer(p.get("offer")!);
    if (p.get("tone")) setTone(p.get("tone")!);
    if (p.get("from") === "template") toast.success("Template applied");
  }, []);

  const applyPreset = (preset: AdCopyPreset) => {
    setProduct(preset.product);
    setAudience(preset.audience);
    setOffer(preset.offer);
    setTone(preset.tone);
    toast.success(`Loaded "${preset.label}"`);
  };

  const profileFn = useServerFn(getMyProfile);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const bpFn = useServerFn(listBrandProfiles);
  const { data: brandProfiles } = useQuery({ queryKey: ["brand-profiles"], queryFn: () => bpFn() });
  const selectedProfileVoice =
    brandProfileId && brandProfiles
      ? brandProfiles.find((p) => p.id === brandProfileId)?.voice ?? ""
      : "";
  const brandVoice = selectedProfileVoice || (profile?.brand_voice ?? "");
  const fieldsReady = product.trim() && audience.trim() && offer.trim();

  const fn = useServerFn(generateAdCopyFn);
  const mutation = useMutation({
    mutationFn: (vars: {
      product: string;
      audience: string;
      offer: string;
      tone: string;
      brandProfileId: string | null;
    }) => fn({ data: vars }),
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
    mutation.mutate({ product, audience, offer, tone, brandProfileId });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ToolHeader
        icon={Megaphone}
        title="Ad Copy Generator"
        description="High-converting headlines and body copy for Meta, Google, and TikTok ads."
      />

      <PresetChips
        presets={ADCOPY_PRESETS}
        onApply={applyPreset}
        getLabel={(p) => p.label}
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
                <Input
                  id="product"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. AI scheduling assistant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target audience</Label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Busy startup founders"
                />
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
            <BrandProfileSelect value={brandProfileId} onChange={setBrandProfileId} />
        </Card>
      </motion.div>

      {fieldsReady ? (
        <PromptPreview
          prompt={buildAdCopyPrompt({ product, audience, offer, tone }, brandVoice)}
          brandVoice={brandVoice}
        />
      ) : (
        <PromptPreviewSkeleton />
      )}

      {mutation.error && !mutation.isPending && (
        <GenerationError
          error={mutation.error as Error}
          onRetry={handle}
          onUpgrade={() => {
            const msg = getUsageLimitMessage(mutation.error as Error);
            if (msg) setUpgradeReason(msg);
          }}
          isRetrying={mutation.isPending}
        />
      )}

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
              <div className="flex gap-1">
                <FavoriteButton generationId={mutation.data.generationId} />
                <ShareButton generationId={mutation.data.generationId} />
              </div>
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
