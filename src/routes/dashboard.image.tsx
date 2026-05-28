import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ImageIcon, Sparkles, Loader2, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateImagePrompt } from "@/lib/ai-mock";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/image")({
  component: ImageTool,
});

function ImageTool() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe the image you want");
      return;
    }
    setLoading(true);
    try {
      const url = await generateImagePrompt(prompt);
      setImage(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <ImageIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">AI Image Generator</h1>
          <p className="mt-1 text-muted-foreground">Marketing visuals from a single prompt.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/60 bg-gradient-card p-6 lg:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="prompt">Image prompt</Label>
            <Textarea id="prompt" rows={8} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A minimalist product shot of a matte black water bottle on a soft pastel gradient backdrop, studio lighting" />
          </div>
          <Button onClick={handle} disabled={loading} className="mt-5 w-full bg-gradient-primary shadow-glow hover:opacity-90" size="lg">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? "Generating…" : "Generate image"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Placeholder output. Connect an image model (e.g. OpenAI gpt-image, Gemini) to ship real generations.
          </p>
        </Card>

        <Card className="flex min-h-[420px] items-center justify-center overflow-hidden border-border/60 bg-gradient-card p-6 lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Conjuring pixels…</p>
            </div>
          ) : image ? (
            <div className="relative w-full">
              <img src={image} alt={prompt} className="aspect-square w-full rounded-xl object-cover shadow-elegant" />
              <Button asChild variant="secondary" size="sm" className="absolute right-3 top-3">
                <a href={image} download target="_blank" rel="noreferrer">
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Save
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-40" />
              <p className="text-sm">Your generated image will appear here</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
