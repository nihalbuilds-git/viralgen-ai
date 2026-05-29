import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { History, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  listGenerations,
  deleteGeneration,
  toggleFavorite,
} from "@/lib/generations.functions";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const list = useServerFn(listGenerations);
  const del = useServerFn(deleteGeneration);
  const fav = useServerFn(toggleFavorite);
  const qc = useQueryClient();

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
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const favMut = useMutation({
    mutationFn: (id: string) => fav({ data: { id } }),
    onSuccess: (r) => {
      toast.success(r.favorited ? "Added to favorites" : "Removed from favorites");
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <History className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Generation history</h1>
          <p className="text-muted-foreground">Everything you've created with ViralGen AI.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="border-border/60 bg-gradient-card p-10 text-center text-muted-foreground">
          No generations yet. Try one of the AI tools to get started.
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((g) => (
            <Card key={g.id} className="border-border/60 bg-gradient-card p-5">
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
                  <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                    {JSON.stringify(g.output, null, 2)}
                  </pre>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => favMut.mutate(g.id)}
                    disabled={favMut.isPending}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => delMut.mutate(g.id)}
                    disabled={delMut.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
