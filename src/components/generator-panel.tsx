import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onGenerate: () => Promise<string[]>;
  ctaLabel?: string;
};

export function GeneratorPanel({ title, description, icon: Icon, children, onGenerate, ctaLabel = "Generate" }: Props) {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const r = await onGenerate();
      setResults(r);
    } catch (e) {
      toast.error("Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card p-6">
        <div className="space-y-4">{children}</div>
        <Button
          onClick={handle}
          disabled={loading}
          className="mt-6 w-full bg-gradient-primary shadow-glow hover:opacity-90 sm:w-auto"
          size="lg"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {loading ? "Generating…" : ctaLabel}
        </Button>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Results</h2>
          {results.map((r, i) => (
            <Card key={i} className="group flex items-start justify-between gap-4 border-border/60 bg-gradient-card p-5">
              <p className="text-sm leading-relaxed">{r}</p>
              <Button variant="ghost" size="icon" onClick={() => copy(r)}>
                <Copy className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
