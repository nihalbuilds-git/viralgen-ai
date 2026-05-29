import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Megaphone, Sparkles, Loader2, Copy } from "lucide-react";
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

export const Route = createFileRoute("/dashboard/adcopy")({
  component: AdCopyTool,
});

function AdCopyTool() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [tone, setTone] = useState("persuasive");

  const fn = useServerFn(generateAdCopyFn);
  const mutation = useMutation({
    mutationFn: (vars: { product: string; audience: string; offer: string; tone: string }) =>
      fn({ data: vars }),
    onError: (e: Error) => toast.error(e.message || "Generation failed"),
    onSuccess: () => toast.success("Ad copy ready"),
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handle = () => {
    if (!product.trim() || !audience.trim() || !offer.trim()) {
      toast.error("Please fill in product, audience, and offer");
      return;
    }
    mutation.mutate({ product, audience, offer, tone });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Megaphone className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">AI Ad Copy Generator</h1>
          <p className="mt-1 text-muted-foreground">
            High-converting headlines and body copy for Meta, Google, and TikTok ads.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card p-6 space-y-4">
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
          className="bg-gradient-primary shadow-glow hover:opacity-90"
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {mutation.isPending ? "Generating…" : "Generate ad copy"}
        </Button>
      </Card>

      {mutation.data && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Results</h2>
          <ResultBlock label="Headline" value={mutation.data.headline} onCopy={copy} />
          <ResultBlock label="Primary text" value={mutation.data.primaryText} onCopy={copy} />
          <ResultBlock label="Call to action" value={mutation.data.cta} onCopy={copy} />
        </div>
      )}
    </div>
  );
}

function ResultBlock({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (s: string) => void;
}) {
  return (
    <Card className="border-border/60 bg-gradient-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onCopy(value)}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
