import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Plus, Trash2, Star, StarOff, Loader2, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  listBrandProfiles,
  createBrandProfile,
  updateBrandProfile,
  deleteBrandProfile,
  type BrandProfile,
} from "@/lib/brand-profiles.functions";

export const Route = createFileRoute("/dashboard/brand-profiles")({
  head: () => ({
    meta: [
      { title: "Brand Profiles — ViralGen AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BrandProfilesPage,
});

function BrandProfilesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listBrandProfiles);
  const createFn = useServerFn(createBrandProfile);
  const updateFn = useServerFn(updateBrandProfile);
  const deleteFn = useServerFn(deleteBrandProfile);

  const { data, isLoading } = useQuery({
    queryKey: ["brand-profiles"],
    queryFn: () => listFn(),
  });

  const [name, setName] = useState("");
  const [voice, setVoice] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["brand-profiles"] });

  const create = useMutation({
    mutationFn: () =>
      createFn({ data: { name: name.trim(), voice: voice.trim(), is_default: (data ?? []).length === 0 } }),
    onSuccess: () => {
      toast.success("Brand profile created");
      setName("");
      setVoice("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => updateFn({ data: { id, is_default: true } }),
    onSuccess: () => {
      toast.success("Default updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Brand Profiles</h1>
          <p className="text-muted-foreground">
            Save a voice per client or project — switch in any generator.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card p-6 space-y-4">
        <h2 className="font-display font-semibold">New profile</h2>
        <div className="space-y-2">
          <Label htmlFor="bp-name">Name</Label>
          <Input
            id="bp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Coffee Co."
            maxLength={80}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bp-voice">Voice</Label>
          <Textarea
            id="bp-voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            placeholder="Warm, witty, direct. Coffee-nerd vocabulary, no jargon. Always sign off with 'Stay caffeinated.'"
            rows={5}
            maxLength={2000}
          />
        </div>
        <Button
          onClick={() => create.mutate()}
          disabled={create.isPending || !name.trim()}
          className="bg-gradient-primary shadow-glow hover:opacity-90"
        >
          {create.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add profile
        </Button>
      </Card>

      <div className="space-y-3">
        <h2 className="font-display font-semibold">Saved profiles</h2>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No profiles yet — add your first above.</p>
        ) : (
          (data ?? []).map((p) => (
            <ProfileRow
              key={p.id}
              profile={p}
              onSetDefault={() => setDefault.mutate(p.id)}
              onSave={async (n, v) => {
                await updateFn({ data: { id: p.id, name: n, voice: v } });
                invalidate();
                toast.success("Saved");
              }}
              onDelete={() => remove.mutate(p.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProfileRow({
  profile,
  onSetDefault,
  onSave,
  onDelete,
}: {
  profile: BrandProfile;
  onSetDefault: () => void;
  onSave: (name: string, voice: string) => Promise<void>;
  onDelete: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [voice, setVoice] = useState(profile.voice);
  const [saving, setSaving] = useState(false);
  const dirty = name !== profile.name || voice !== profile.voice;

  return (
    <Card className="border-border/60 bg-card/60 p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="w-auto min-w-[200px] font-medium" />
          {profile.is_default && <Badge variant="outline" className="gap-1"><Star className="h-3 w-3 text-primary" />Default</Badge>}
        </div>
        <div className="flex gap-1">
          {!profile.is_default && (
            <Button variant="ghost" size="sm" onClick={onSetDefault} aria-label="Set as default">
              <StarOff className="mr-1 h-3.5 w-3.5" /> Make default
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Delete profile">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{profile.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This can't be undone. Generations that used this voice will keep their text.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <Textarea value={voice} onChange={(e) => setVoice(e.target.value)} rows={4} />
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(name, voice);
            } finally {
              setSaving(false);
            }
          }}
          className="bg-gradient-primary shadow-glow hover:opacity-90"
        >
          {saving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
          Save
        </Button>
      </div>
    </Card>
  );
}
