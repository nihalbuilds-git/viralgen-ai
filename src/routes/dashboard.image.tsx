import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ImageIcon, Sparkles, Loader2, Download, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { streamImage } from "@/lib/stream-image";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/image")({
  component: ImageTool,
});

const STYLES = [
  { id: "realistic", label: "Realistic", suffix: "photorealistic, ultra-detailed, natural lighting, 50mm lens, shallow depth of field" },
  { id: "3d", label: "3D", suffix: "octane 3D render, soft global illumination, subsurface scattering, studio HDRI" },
  { id: "cartoon", label: "Cartoon", suffix: "vibrant cartoon illustration, bold outlines, flat shading, playful" },
  { id: "minimal", label: "Minimal", suffix: "minimalist design, generous whitespace, soft pastel palette, clean composition" },
  { id: "luxury", label: "Luxury", suffix: "luxury editorial, gold and marble accents, cinematic lighting, premium product photography" },
  { id: "cyberpunk", label: "Cyberpunk", suffix: "cyberpunk neon, rain-soaked street, magenta and cyan lights, futuristic, moody" },
];

const RATIOS = [
  { id: "1:1", label: "Square 1:1", size: "1024x1024" },
  { id: "3:2", label: "Landscape 3:2", size: "1536x1024" },
  { id: "2:3", label: "Portrait 2:3", size: "1024x1536" },
];

type Slot = { src: string | null; isFinal: boolean; loading: boolean };

function ImageTool() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [ratio, setRatio] = useState("1:1");
  const [count, setCount] = useState(2);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const loading = slots.some((s) => s.loading);

  const handle = async () => {
    if (!prompt.trim()) {
      toast.error("Describe the image you want to create");
      return;
    }
    const styleDef = STYLES.find((s) => s.id === style)!;
    const ratioDef = RATIOS.find((r) => r.id === ratio)!;
    const fullPrompt = `${prompt.trim()}. Style: ${styleDef.suffix}.`;

    const initial: Slot[] = Array.from({ length: count }, () => ({
      src: null,
      isFinal: false,
      loading: true,
    }));
    setSlots(initial);

    await Promise.all(
      initial.map((_, i) =>
        streamImage(
          "/api/generate-image",
          { prompt: fullPrompt, size: ratioDef.size },
          (dataUrl, isFinal) => {
            setSlots((prev) => {
              const next = [...prev];
              next[i] = { src: dataUrl, isFinal, loading: !isFinal };
              return next;
            });
          },
        ).catch((err) => {
          toast.error(err.message ?? "Generation failed");
          setSlots((prev) => {
            const next = [...prev];
            next[i] = { src: null, isFinal: false, loading: false };
            return next;
          });
        }),
      ),
    );
  };

  const download = (src: string, idx: number) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `viralgen-${Date.now()}-${idx + 1}.png`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <ImageIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">AI Image Generator</h1>
          <p className="mt-1 text-muted-foreground">
            Generate on-brand marketing visuals from a prompt.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/60 bg-gradient-card p-6 lg:col-span-2 h-fit lg:sticky lg:top-20">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A matte black water bottle on a soft pastel gradient backdrop, studio lighting"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Aspect ratio</Label>
                <Select value={ratio} onValueChange={setRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RATIOS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Variations</Label>
              <div className="flex gap-2">
                {[1, 2, 4].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={count === n ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCount(n)}
                    className={cn("flex-1", count === n && "bg-gradient-primary")}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handle}
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-primary shadow-glow hover:opacity-90"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {loading ? "Generating…" : "Generate"}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-3">
          {slots.length === 0 ? (
            <Card className="flex min-h-[420px] flex-col items-center justify-center gap-3 border-border/60 border-dashed bg-gradient-card p-10 text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-40" />
              <p className="text-sm">Your generated images will appear here</p>
            </Card>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                slots.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
              )}
            >
              {slots.map((slot, i) => (
                <Card
                  key={i}
                  className="group relative overflow-hidden border-border/60 bg-gradient-card p-0 transition-all hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className="relative aspect-square w-full">
                    {!slot.src ? (
                      <Skeleton className="absolute inset-0 h-full w-full" />
                    ) : (
                      <>
                        <img
                          src={slot.src}
                          alt={`Generation ${i + 1}`}
                          onClick={() => slot.isFinal && setLightbox(slot.src)}
                          className={cn(
                            "h-full w-full cursor-pointer object-cover transition-[filter] duration-500",
                            !slot.isFinal && "blur-2xl scale-105",
                          )}
                        />
                        {!slot.isFinal && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                        {slot.isFinal && (
                          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0">
                            <span className="text-xs font-medium text-white/90">
                              Variation {i + 1}
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                download(slot.src!, i);
                              }}
                            >
                              <Download className="mr-1.5 h-3.5 w-3.5" />
                              Save
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6 backdrop-blur-md animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </Button>
          <img
            src={lightbox}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-elegant"
          />
        </div>
      )}
    </div>
  );
}
