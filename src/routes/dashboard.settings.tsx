import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save, Settings as SettingsIcon, User, CreditCard, Bell, Palette, Check } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";
import { PLANS, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const get = useServerFn(getMyProfile);
  const upd = useServerFn(updateMyProfile);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => get() });

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [plan, setPlan] = useState<PlanId>("free");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifProduct, setNotifProduct] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);

  useEffect(() => {
    if (data) {
      setDisplayName(data.display_name ?? "");
      setAvatarUrl(data.avatar_url ?? "");
      setBrandVoice(data.brand_voice ?? "");
    }
  }, [data]);

  const mut = useMutation({
    mutationFn: () => upd({
      data: {
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        brand_voice: brandVoice || null,
      },
    }),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <SettingsIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Personalize ViralGen to fit how you work.</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid">
          <TabsTrigger value="profile"><User className="mr-1.5 h-3.5 w-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="subscription"><CreditCard className="mr-1.5 h-3.5 w-3.5" />Plan</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" />Alerts</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-1.5 h-3.5 w-3.5" />Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
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
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandVoice">Brand voice</Label>
                  <Textarea
                    id="brandVoice"
                    value={brandVoice}
                    onChange={(e) => setBrandVoice(e.target.value)}
                    rows={5}
                    placeholder="Describe your brand's tone — used to personalize future generations."
                  />
                </div>
                <Button onClick={() => mut.mutate()} disabled={mut.isPending} className="bg-gradient-primary shadow-glow hover:opacity-90">
                  {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save changes
                </Button>
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <Card
                key={p.id}
                className={cn(
                  "border-border/60 bg-gradient-card p-5 transition-all",
                  plan === p.id && "border-primary shadow-glow",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold">{p.name}</h3>
                  {p.featured && <Badge className="bg-gradient-primary">Popular</Badge>}
                </div>
                <div className="mt-2 font-display text-2xl font-bold">
                  {p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs">
                  {p.features.filter((f) => f.included).slice(0, 3).map((f) => (
                    <li key={f.label} className="flex items-start gap-1.5">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {f.label}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={plan === p.id ? "default" : "outline"}
                  className={cn("mt-4 w-full", plan === p.id && "bg-gradient-primary shadow-glow")}
                  onClick={() => { setPlan(p.id); toast.success(`Switched to ${p.name}`); }}
                >
                  {plan === p.id ? "Current plan" : "Select"}
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Want the full comparison? <Link to="/pricing" className="text-primary underline-offset-2 hover:underline">See pricing</Link>
          </p>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="border-border/60 bg-gradient-card p-6 space-y-5">
            <Row title="Email notifications" desc="Account, billing, and security alerts." checked={notifEmail} onChange={setNotifEmail} />
            <Row title="Product updates" desc="New features, tools, and templates." checked={notifProduct} onChange={setNotifProduct} />
            <Row title="Weekly insights" desc="Your viral scores and trending themes — every Monday." checked={notifWeekly} onChange={setNotifWeekly} />
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card className="border-border/60 bg-gradient-card p-6 space-y-4">
            <div>
              <Label>Theme</Label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); toast.success(`Theme: ${t}`); }}
                    className={cn(
                      "rounded-xl border p-4 text-sm font-medium capitalize transition-colors",
                      theme === t ? "border-primary bg-accent" : "border-border/60 hover:bg-accent/60",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
