import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { User, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const get = useServerFn(getMyProfile);
  const upd = useServerFn(updateMyProfile);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => get(),
  });

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [brandVoice, setBrandVoice] = useState("");

  useEffect(() => {
    if (data) {
      setDisplayName(data.display_name ?? "");
      setAvatarUrl(data.avatar_url ?? "");
      setBrandVoice(data.brand_voice ?? "");
    }
  }, [data]);

  const mut = useMutation({
    mutationFn: () =>
      upd({
        data: {
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
          brand_voice: brandVoice || null,
        },
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <User className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account and brand voice.</p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card p-6 space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandVoice">Brand voice</Label>
              <Textarea
                id="brandVoice"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="Describe your brand's tone and style — used to personalize future generations."
                rows={5}
              />
            </div>
            <Button
              onClick={() => mut.mutate()}
              disabled={mut.isPending}
              className="bg-gradient-primary shadow-glow hover:opacity-90"
            >
              {mut.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save changes
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
