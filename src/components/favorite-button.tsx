import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/lib/generations.functions";

export function FavoriteButton({ generationId }: { generationId?: string | null }) {
  const [favorited, setFavorited] = useState(false);
  const fn = useServerFn(toggleFavorite);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () => fn({ data: { id: generationId! } }),
    onSuccess: (r) => {
      setFavorited(r.favorited);
      toast.success(r.favorited ? "Added to favorites" : "Removed from favorites");
      qc.invalidateQueries({ queryKey: ["favorites"] });
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
