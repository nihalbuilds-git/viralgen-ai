import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TEMPLATES, CATEGORIES, type Category, type Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const [cat, setCat] = useState<Category | "All">("All");
  const [preview, setPreview] = useState<Template | null>(null);
  const items = useMemo(
    () => (cat === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat)),
    [cat],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Prompt templates</h1>
          <p className="text-muted-foreground">Battle-tested formulas to kickstart any piece of content.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              cat === c
                ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow"
                : "border-border/60 hover:bg-accent",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="group flex h-full flex-col border-border/60 bg-gradient-card p-5 transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                  <t.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
              </div>
              <h3 className="mt-4 font-display font-semibold">{t.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreview(t)}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                </Button>
                <Button asChild size="sm" className="bg-gradient-primary shadow-glow hover:opacity-90">
                  <Link to="/dashboard/caption">Use template</Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{preview?.name}</DialogTitle>
            <DialogDescription>{preview?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Prompt</div>
              <div className="rounded-lg border border-border/60 bg-accent/40 p-3 text-sm">{preview?.prompt}</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Example output</div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm italic">{preview?.example}</div>
            </div>
          </div>
          <DialogFooter>
            <Button asChild className="bg-gradient-primary shadow-glow hover:opacity-90">
              <Link to="/dashboard/caption" onClick={() => setPreview(null)}>Use this template</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
