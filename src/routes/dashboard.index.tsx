import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageSquare,
  Megaphone,
  Package,
  ImageIcon,
  TrendingUp,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { listGenerations } from "@/lib/generations.functions";
import { getMyProfile } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const MONTHLY_QUOTA = 5000;

const tools = [
  { title: "Caption Generator", desc: "Scroll-stopping social captions", url: "/dashboard/caption", icon: MessageSquare, color: "from-indigo-500 to-purple-500" },
  { title: "Ad Copy", desc: "High-converting ad headlines & body", url: "/dashboard/adcopy", icon: Megaphone, color: "from-fuchsia-500 to-pink-500" },
  { title: "Product Description", desc: "Persuasive product copy", url: "/dashboard/product", icon: Package, color: "from-blue-500 to-cyan-500" },
  { title: "AI Image Generator", desc: "Marketing visuals from text", url: "/dashboard/image", icon: ImageIcon, color: "from-purple-500 to-pink-500" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function previewOf(output: unknown): string {
  if (!output || typeof output !== "object") return "";
  const o = output as Record<string, unknown>;
  if (Array.isArray(o.captions) && o.captions[0]) return String(o.captions[0]);
  if (typeof o.headline === "string") return o.headline;
  if (typeof o.description === "string") return o.description;
  if (typeof o.imageUrl === "string") return "Generated image";
  return JSON.stringify(output).slice(0, 140);
}

function DashboardHome() {
  const { user } = useAuth();
  const list = useServerFn(listGenerations);
  const getProfile = useServerFn(getMyProfile);

  const { data: generations } = useQuery({
    queryKey: ["generations"],
    queryFn: () => list({ data: { limit: 100 } }),
  });
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const thisMonth = (generations ?? []).filter(
    (g) => new Date(g.created_at).getTime() >= monthStart,
  );
  const wordCount = (generations ?? []).reduce((acc, g) => {
    const s = JSON.stringify(g.output ?? {});
    return acc + s.split(/\s+/).filter(Boolean).length;
  }, 0);
  const hoursSaved = Math.round((generations?.length ?? 0) * 0.25);

  const stats = [
    { label: "Generations this month", value: thisMonth.length.toLocaleString(), icon: Zap },
    { label: "Words created", value: wordCount.toLocaleString(), icon: TrendingUp },
    { label: "Hours saved", value: `${hoursSaved} hrs`, icon: Clock },
  ];

  const recent = (generations ?? []).slice(0, 5);
  const used = thisMonth.length;
  const pct = Math.min(100, Math.round((used / MONTHLY_QUOTA) * 100));
  const name = profile?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Welcome back, {name} 👋</h1>
        <p className="mt-1 text-muted-foreground">Let's create something that travels today.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60 bg-gradient-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <s.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-4 font-display text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Usage */}
      <Card className="border-border/60 bg-gradient-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Monthly usage</h3>
            <p className="text-sm text-muted-foreground">
              {used.toLocaleString()} of {MONTHLY_QUOTA.toLocaleString()} generations used
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/pricing">Upgrade</Link>
          </Button>
        </div>
        <Progress value={pct} className="mt-4 h-2" />
      </Card>

      {/* AI tools */}
      <div>
        <h2 className="mb-4 font-display text-xl font-semibold">AI Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <Link key={t.url} to={t.url}>
              <Card className="group h-full border-border/60 bg-gradient-card p-5 transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} shadow-glow`}>
                  <t.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent generations */}
      <Card className="border-border/60 bg-gradient-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Recent generations</h3>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No generations yet — pick a tool above to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {recent.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium capitalize text-accent-foreground">
                    {r.type}
                  </span>
                  <p className="mt-2 line-clamp-1 text-sm">{previewOf(r.output)}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(r.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
