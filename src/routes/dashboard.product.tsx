import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateProductDescriptionFn } from "@/lib/ai.functions";
import { FavoriteButton } from "@/components/favorite-button";
import { CopyButton } from "@/components/copy-button";
import { ToolHeader } from "@/components/tool-header";
import { UpgradeModal } from "@/components/upgrade-modal";
import { GenerationError } from "@/components/generation-error";
import { PromptPreview, PromptPreviewSkeleton } from "@/components/prompt-preview";
import { PresetChips } from "@/components/preset-chips";
import { PRODUCT_PRESETS, type ProductPreset } from "@/lib/presets";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/profile.functions";
import { buildProductPrompt } from "@/lib/prompts";
import { getUsageLimitMessage } from "@/lib/usage-errors";

export const Route = createFileRoute("/dashboard/product")({
  head: () => ({
    meta: [
      { title: "Product Description Generator — ViralGen AI" },
      { name: "description", content: "SEO-friendly product descriptions that turn browsers into buyers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProductTool,
});

function ProductTool() {
  const [name, setName] = useState("");
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("");
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("name")) setName(p.get("name")!);
    if (p.get("features")) setFeatures(p.get("features")!);
    if (p.get("audience")) setAudience(p.get("audience")!);
    if (p.get("from") === "template") toast.success("Template applied");
  }, []);

  const applyPreset = (preset: ProductPreset) => {
    setName(preset.name);
    setFeatures(preset.features);
    setAudience(preset.audience);
    toast.success(`Loaded "${preset.label}"`);
  };

  const profileFn = useServerFn(getMyProfile);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const brandVoice = profile?.brand_voice ?? "";
  const fieldsReady = name.trim() && features.trim() && audience.trim();

  const fn = useServerFn(generateProductDescriptionFn);
  const mutation = useMutation({
    mutationFn: (vars: { name: string; features: string; audience: string }) => fn({ data: vars }),
    onError: (e: Error) => {
      const limitMessage = getUsageLimitMessage(e);
      if (limitMessage) setUpgradeReason(limitMessage);
      else toast.error(e.message || "Generation failed");
    },
    onSuccess: () => {
      toast.success("Description ready");
      qc.invalidateQueries({ queryKey: ["generations"] });
      qc.invalidateQueries({ queryKey: ["usage"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const handle = () => {
    if (!name.trim() || !features.trim() || !audience.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    mutation.mutate({ name, features, audience });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ToolHeader
        icon={Package}
        title="Product Description"
        description="SEO-friendly copy that turns browsers into buyers."
      />

      <PresetChips
        presets={PRODUCT_PRESETS}
        onApply={applyPreset}
        getLabel={(p) => p.label}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="gradient-border glass relative overflow-hidden rounded-2xl border-0 p-6 shadow-soft md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-primary opacity-15 blur-3xl" />
          <div className="relative space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aero Hoodie"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target audience</Label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Outdoor enthusiasts and digital nomads"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Key features / benefits</Label>
              <Textarea
                id="features"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="merino wool, lightweight, water-resistant, ethically made"
                rows={4}
              />
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
              {mutation.isPending ? "Generating…" : "Generate description"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {fieldsReady ? (
        <PromptPreview
          prompt={buildProductPrompt({ name, features, audience }, brandVoice)}
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
          >
            <Card className="gradient-border hover-lift group rounded-2xl border-0 bg-card/60 p-6 backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  SEO description
                </p>
                <div className="flex shrink-0 gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                  <FavoriteButton generationId={mutation.data.generationId} />
                  <CopyButton text={mutation.data.description} />
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {mutation.data.description}
              </p>
            </Card>
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
