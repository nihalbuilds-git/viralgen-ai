import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { ToolHeader } from "@/components/tool-header";

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
    <div className="mx-auto max-w-6xl space-y-8">
      <ToolHeader
        icon={ImageIcon}
        title="Image Generator"
        description="Generate on-brand marketing visuals from a single prompt."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 lg:sticky lg:top-20 h-fit"
        >
          <Card className="gradient-border glass relative overflow-hidden rounded-2xl border-0 p-6 shadow-soft">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
            <div className="relative space-y-4">
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Aspect ratio</Label>
                  <Select value={ratio} onValueChange={setRatio}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RATIOS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
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
                      className={cn("flex-1 transition-all", count === n && "bg-gradient-primary shadow-glow")}
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
                className="btn-shine w-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] hover:opacity-95"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {loading ? "Generating…" : "Generate"}
              </Button>
            </div>
          </Card>
        </motion.div>

        <div className="lg:col-span-3">
          {slots.length === 0 ? (
            <Card className="gradient-border glass flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border-0 border-dashed p-10 text-muted-foreground">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-primary opacity-20 blur-2xl" />
                <ImageIcon className="relative h-12 w-12 opacity-50" />
              </div>
              <p className="text-sm">Your generated images will appear here</p>
            </Card>
          ) : (
            <div className={cn("grid gap-4", slots.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
              {slots.map((slot, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <Card className="gradient-border group relative overflow-hidden rounded-2xl border-0 bg-card/60 p-0 shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                    <div className="relative aspect-square w-full">
                      {!slot.src ? (
                        <div className="absolute inset-0">
                          <Skeleton className="absolute inset-0 h-full w-full" />
                          <div className="shimmer absolute inset-0" />
                        </div>
                      ) : (
                        <>
                          <img
                            src={slot.src}
                            alt={`Generation ${i + 1}`}
                            onClick={() => slot.isFinal && setLightbox(slot.src)}
                            className={cn(
                              "h-full w-full cursor-pointer object-cover transition-[filter,transform] duration-500",
                              !slot.isFinal && "blur-2xl scale-105",
                              slot.isFinal && "group-hover:scale-[1.03]",
                            )}
                          />
                          {!slot.isFinal && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          )}
                          {slot.isFinal && (
                            <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0">
                              <span className="text-xs font-medium tracking-wide text-white/90">
                                Variation {i + 1}
                              </span>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="backdrop-blur"
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6 backdrop-blur-md"
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
            <motion.img
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              src={lightbox}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-elegant"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
