import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile saved");
    }, 600);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <User className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Profile</h1>
          <p className="mt-1 text-muted-foreground">Manage your account and brand voice.</p>
        </div>
      </div>

      <Card className="border-border/60 bg-gradient-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
              JD
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Jane Doe</h3>
            <p className="text-sm text-muted-foreground">jane@brand.com</p>
            <Badge className="mt-2 bg-gradient-primary">Pro plan</Badge>
          </div>
        </div>
      </Card>

      <form onSubmit={save}>
        <Card className="border-border/60 bg-gradient-card p-6">
          <h3 className="font-display text-lg font-semibold">Account details</h3>
          <Separator className="my-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fn">Full name</Label>
              <Input id="fn" defaultValue="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="em">Email</Label>
              <Input id="em" type="email" defaultValue="jane@brand.com" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="brand">Brand voice</Label>
              <Textarea id="brand" rows={4} placeholder="Describe your tone, style, audience, and what to avoid…" defaultValue="Warm, witty, and confident. Speaks to creators 25–40. Avoid jargon." />
            </div>
          </div>

          <h3 className="mt-8 font-display text-lg font-semibold">Subscription</h3>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pro — $29/mo</p>
              <p className="text-sm text-muted-foreground">Renews on April 14, 2026</p>
            </div>
            <Button variant="outline" type="button">Manage</Button>
          </div>

          <div className="mt-8 flex justify-end gap-2">
            <Button type="button" variant="ghost">Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-gradient-primary shadow-glow hover:opacity-90">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
