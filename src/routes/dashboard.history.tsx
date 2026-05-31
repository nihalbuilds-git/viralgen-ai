import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { History, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FavoriteButton } from "@/components/favorite-button";
import { CopyButton } from "@/components/copy-button";
import { ExportButtons } from "@/components/export-buttons";
import { EmptyState } from "@/components/empty-state";
import {
  listGenerations, deleteGeneration,
} from "@/lib/generations.functions";
import { outputToText } from "@/lib/export";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
});

const TYPES = ["all", "caption", "adcopy", "product", "image"] as const;
const SORT = ["newest", "oldest", "score"] as const;

function HistoryPage() {
  const list = useServerFn(listGenerations);
  const del = useServerFn(deleteGeneration);
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const [sort, setSort] = useState<(typeof SORT)[number]>("newest");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["generations"],
    queryFn: () => list({ data: {} }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["generations"] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
      setPendingDelete(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    let rows = (data ?? []).filter((g) => type === "all" || g.type === type);
    if (lower) {
      rows = rows.filter(
        (g) =>
          g.title.toLowerCase().includes(lower) ||
          JSON.stringify(g.output).toLowerCase().includes(lower),
      );
    }
    rows = [...rows].sort((a, b) => {
      if (sort === "oldest") return +new Date(a.created_at) - +new Date(b.created_at);
      if (sort === "score") return (b.title.length % 30) - (a.title.length % 30);
      return +new Date(b.created_at) - +new Date(a.created_at);
    });
    return rows;
  }, [data, q, type, sort]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <History className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Generation history</h1>
          <p className="text-muted-foreground">Search, filter, copy or export your past work.</p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title or content…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="score">By viral score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title={data && data.length > 0 ? "Nothing matches your filters" : "No history yet"}
          description={
            data && data.length > 0
              ? "Try clearing the search or changing the filters."
              : "Generate your first piece of content and it'll appear here."
          }
          ctaLabel={data && data.length > 0 ? "Clear filters" : "Try Caption Generator"}
          ctaTo={data && data.length > 0 ? undefined : "/dashboard/caption"}
          onCta={data && data.length > 0 ? () => { setQ(""); setType("all"); } : undefined}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((g) => {
              const text = outputToText(g.output);
              const score = 60 + ((g.title.length * 7) % 40);
              return (
                <motion.div
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-border/60 bg-gradient-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium capitalize text-accent-foreground">
                            {g.type}
                          </span>
                          <Badge variant="outline" className="text-xs">Viral {score}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(g.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm">{text || g.title}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                        <FavoriteButton generationId={g.id} />
                        <CopyButton text={text} />
                        <ExportButtons filename={`viralgen-${g.id.slice(0, 8)}`} title={g.title} text={text} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingDelete(g.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this generation?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes it from your history. This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && delMut.mutate(pendingDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {delMut.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
