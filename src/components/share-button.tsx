import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Share2, Globe, Lock, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { getGenerationShareStatus, toggleGenerationPublic } from "@/lib/share.functions";

interface Props {
  generationId?: string;
}

export function ShareButton({ generationId }: Props) {
  const qc = useQueryClient();
  const statusFn = useServerFn(getGenerationShareStatus);
  const toggleFn = useServerFn(toggleGenerationPublic);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["share-status", generationId],
    queryFn: () => statusFn({ data: { id: generationId! } }),
    enabled: Boolean(generationId) && open,
  });

  const mutate = useMutation({
    mutationFn: () => toggleFn({ data: { id: generationId! } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["share-status", generationId] });
      toast.success(res.isPublic ? "Share link is live" : "Share link disabled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!generationId) return null;

  const isPublic = data?.isPublic ?? false;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${generationId}` : "";

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Share">
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
            <div>
              <p className="text-sm font-medium">{isPublic ? "Public" : "Private"}</p>
              <p className="text-xs text-muted-foreground">
                {isPublic ? "Anyone with the link can view" : "Only you can view"}
              </p>
            </div>
          </div>
          {isLoading || mutate.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={isPublic}
              onCheckedChange={() => mutate.mutate()}
              aria-label="Toggle public share"
            />
          )}
        </div>
        {isPublic && (
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 truncate rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Share URL"
            />
            <Button size="sm" variant="outline" onClick={copy} aria-label="Copy link">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
