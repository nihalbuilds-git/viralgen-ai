import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getFavoriteStatus, toggleFavorite } from "@/lib/generations.functions";

export function FavoriteButton({ generationId }: { generationId?: string | null }) {
  const fn = useServerFn(toggleFavorite);
  const statusFn = useServerFn(getFavoriteStatus);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["favorite-status", generationId],
    queryFn: () => statusFn({ data: { id: generationId! } }),
    enabled: Boolean(generationId),
  });

  const favorited = Boolean(data?.favorited);

  const mut = useMutation({
    mutationFn: () => fn({ data: { id: generationId! } }),
    onSuccess: (r) => {
      toast.success(r.favorited ? "Added to favorites" : "Removed from favorites");
      qc.setQueryData(["favorite-status", generationId], r);
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["generations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!generationId) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => mut.mutate()}
      disabled={mut.isPending}
      aria-label={favorited ? "Unfavorite" : "Favorite"}
    >
      <Star className={`h-4 w-4 ${favorited ? "fill-primary text-primary" : ""}`} />
    </Button>
  );
}
