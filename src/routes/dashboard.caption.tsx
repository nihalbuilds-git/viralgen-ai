import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { ExportButtons } from "@/components/export-buttons";
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
import { generateCaptionsFn } from "@/lib/ai.functions";
import { FavoriteButton } from "@/components/favorite-button";
import { ToolHeader } from "@/components/tool-header";
import { UpgradeModal } from "@/components/upgrade-modal";
import { GenerationError } from "@/components/generation-error";
import { PromptPreview, PromptPreviewSkeleton } from "@/components/prompt-preview";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/profile.functions";
import { buildCaptionPrompt } from "@/lib/prompts";
import { getUsageLimitMessage } from "@/lib/usage-errors";

export const Route = createFileRoute("/dashboard/caption")({
  component: CaptionTool,
});

function CaptionTool() {
  const [platform, setPlatform] = useState("Instagram");
  const [product, setProduct] = useState("");
  const [tone, setTone] = useState("engaging");
  const [audience, setAudience] = useState("");
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const qc = useQueryClient();

  const profileFn = useServerFn(getMyProfile);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const brandVoice = profile?.brand_voice ?? "";
  const fieldsReady = product.trim().length > 0 && audience.trim().length > 0;

  const fn = useServerFn(generateCaptionsFn);
  const mutation = useMutation({
    mutationFn: (vars: { platform: string; product: string; tone: string; audience: string }) =>
      fn({ data: vars }),
    onError: (e: Error) => {
      const limitMessage = getUsageLimitMessage(e);
      if (limitMessage) setUpgradeReason(limitMessage);
      else toast.error(e.message || "Generation failed");
    },
    onSuccess: () => {
      toast.success("Captions ready");
      qc.invalidateQueries({ queryKey: ["generations"] });
      qc.invalidateQueries({ queryKey: ["usage"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const handle = () => {
    if (!product.trim() || !audience.trim()) {
      toast.error("Please fill in product and audience");
      return;
    }
    mutation.mutate({ platform, product, tone, audience });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ToolHeader
        icon={MessageSquare}
        title="Caption Generator"
        description="Scroll-stopping captions for Instagram, TikTok, X, and LinkedIn — calibrated to your audience."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="gradient-border glass relative overflow-hidden rounded-2xl border-0 p-6 shadow-soft md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
          <div className="relative space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="X (Twitter)">X (Twitter)</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engaging">Engaging</SelectItem>
                    <SelectItem value="witty">Witty</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product / service</Label>
              <Textarea
                id="product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. A new AI-powered scheduling assistant for solopreneurs"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target audience</Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Busy freelancers in their 30s"
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
              {mutation.isPending ? "Generating…" : "Generate captions"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {fieldsReady ? (
        <PromptPreview
          prompt={buildCaptionPrompt({ platform, product, tone, audience }, brandVoice)}
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
            <h2 className="font-display text-lg font-semibold tracking-tight">Results</h2>
            <div className="grid gap-4">
              {mutation.data.captions.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Card className="gradient-border hover-lift group flex items-start justify-between gap-4 rounded-2xl border-0 bg-card/60 p-5 backdrop-blur">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground shadow-glow">
                        {i + 1}
                      </span>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{c}</p>
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                      {i === 0 && <FavoriteButton generationId={mutation.data?.generationId} />}
                      <CopyButton text={c} />
                      <ExportButtons
                        filename={`caption-${i + 1}`}
                        title={`Caption ${i + 1}`}
                        text={c}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
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
