import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listFavorites, toggleFavorite } from "@/lib/generations.functions";

export const Route = createFileRoute("/dashboard/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const list = useServerFn(listFavorites);
  const fav = useServerFn(toggleFavorite);
  const qc = useQueryClient();

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
            const imageUrl =
              g.output && typeof g.output === "object" && "imageUrl" in g.output
                ? String((g.output as Record<string, unknown>).imageUrl ?? "")
                : "";
            return (
              <Card key={f.id} className="border-border/60 bg-gradient-card p-5">
                <div className="flex items-start justify-between gap-4">
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
                  >
                    <Star className="h-4 w-4 fill-current text-primary" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
