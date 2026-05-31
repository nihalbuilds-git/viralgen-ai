import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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

export const Route = createFileRoute("/dashboard/caption")({
  component: CaptionTool,
});

function CaptionTool() {
  const [platform, setPlatform] = useState("Instagram");
  const [product, setProduct] = useState("");
  const [tone, setTone] = useState("engaging");
  const [audience, setAudience] = useState("");

  const fn = useServerFn(generateCaptionsFn);
  const mutation = useMutation({
    mutationFn: (vars: { platform: string; product: string; tone: string; audience: string }) =>
      fn({ data: vars }),
    onError: (e: Error) => toast.error(e.message || "Generation failed"),
    onSuccess: () => toast.success("Captions ready"),
  });




  const handle = () => {
    if (!product.trim() || !audience.trim()) {
      toast.error("Please fill in product and audience");
      return;
    }
    mutation.mutate({ platform, product, tone, audience });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">AI Caption Generator</h1>
          <p className="mt-1 text-muted-foreground">
            Scroll-stopping captions for Instagram, TikTok, X, and LinkedIn.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
              <SelectTrigger><SelectValue /></SelectTrigger>
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
          className="bg-gradient-primary shadow-glow hover:opacity-90"
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {mutation.isPending ? "Generating…" : "Generate captions"}
        </Button>
      </Card>

      {mutation.data && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Results</h2>
          {mutation.data.captions.map((c, i) => (
            <Card
              key={i}
              className="group flex items-start justify-between gap-4 border-border/60 bg-gradient-card p-5"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{c}</p>
              <div className="flex shrink-0 gap-1">
                {i === 0 && <FavoriteButton generationId={mutation.data?.generationId} />}
                <CopyButton text={c} />
                <ExportButtons filename={`caption-${i + 1}`} title={`Caption ${i + 1}`} text={c} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
