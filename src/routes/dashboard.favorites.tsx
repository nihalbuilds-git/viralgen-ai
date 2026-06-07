import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, Loader2, Trash2, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  listFavorites,
  toggleFavorite,
  bulkRemoveFavorites,
} from "@/lib/generations.functions";

export const Route = createFileRoute("/dashboard/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const list = useServerFn(listFavorites);
  const fav = useServerFn(toggleFavorite);
  const bulk = useServerFn(bulkRemoveFavorites);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => list(),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => fav({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed from favorites");
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkMut = useMutation({
    mutationFn: (ids: string[]) => bulk({ data: { generationIds: ids } }),
    onSuccess: (res) => {
      toast.success(`Removed ${res.removed} favorite${res.removed === 1 ? "" : "s"}`);
      setSelected(new Set());
      setConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visibleIds = useMemo(
    () =>
      (data ?? [])
        .map((f) => f.generation?.id)
        .filter((id): id is string => Boolean(id)),
    [data],
  );
  const allSelected = visibleIds.length > 0 && selected.size === visibleIds.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(visibleIds));

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Star className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground">Your starred generations, always within reach.</p>
        </div>
      </div>

      {visibleIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-3 backdrop-blur">
          <Button variant="ghost" size="sm" onClick={toggleAll} className="gap-2">
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : someSelected ? (
              <CheckSquare className="h-4 w-4 text-primary/70" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {allSelected ? "Deselect all" : "Select all"}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {selected.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              disabled={selected.size === 0 || bulkMut.isPending}
              onClick={() => setConfirmOpen(true)}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="border-border/60 bg-gradient-card p-10 text-center text-muted-foreground">
          No favorites yet. Star a generation from your history.
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((f) => {
            const g = f.generation;
            if (!g) return null;
            const checked = selected.has(g.id);
            const imageUrl =
              g.output && typeof g.output === "object" && "imageUrl" in g.output
                ? String((g.output as Record<string, unknown>).imageUrl ?? "")
                : "";
            return (
              <Card
                key={f.id}
                className={`border-border/60 bg-gradient-card p-5 transition-colors ${
                  checked ? "ring-2 ring-primary/60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleOne(g.id)}
                    className="mt-1"
                    aria-label="Select favorite"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium capitalize text-accent-foreground">
                        {g.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(g.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{g.title}</p>
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={g.title}
                        className="mt-3 aspect-video w-full max-w-sm rounded-xl object-cover"
                        loading="lazy"
                      />
                    )}
                    <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                      {JSON.stringify(g.output, null, 2)}
                    </pre>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMut.mutate(g.id)}
                    disabled={removeMut.isPending}
                    title="Remove from favorites"
                  >
                    <Star className="h-4 w-4 fill-current text-primary" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {selected.size} favorite{selected.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The underlying generations stay in your history. You can re-star them anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkMut.mutate([...selected])}
              disabled={bulkMut.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkMut.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
