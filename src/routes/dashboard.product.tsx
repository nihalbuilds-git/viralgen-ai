import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Package, Sparkles, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateProductDescriptionFn } from "@/lib/ai.functions";
import { FavoriteButton } from "@/components/favorite-button";

export const Route = createFileRoute("/dashboard/product")({
  component: ProductTool,
});

function ProductTool() {
  const [name, setName] = useState("");
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("");

  const fn = useServerFn(generateProductDescriptionFn);
  const mutation = useMutation({
    mutationFn: (vars: { name: string; features: string; audience: string }) =>
      fn({ data: vars }),
    onError: (e: Error) => toast.error(e.message || "Generation failed"),
    onSuccess: () => toast.success("Description ready"),
  });

  const handle = () => {
    if (!name.trim() || !features.trim() || !audience.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    mutation.mutate({ name, features, audience });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Package className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Product Description Generator</h1>
          <p className="mt-1 text-muted-foreground">
            SEO-friendly copy that turns browsers into buyers.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aero Hoodie" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="audience">Target audience</Label>
          <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Outdoor enthusiasts and digital nomads" />
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
          className="bg-gradient-primary shadow-glow hover:opacity-90"
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {mutation.isPending ? "Generating…" : "Generate description"}
        </Button>
      </Card>

      {mutation.data && (
        <Card className="border-border/60 bg-gradient-card p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {mutation.data.description}
            </p>
            <div className="flex shrink-0 gap-1">
              <FavoriteButton generationId={mutation.data.generationId} />
              <Button variant="ghost" size="icon" onClick={() => copy(mutation.data.description)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
