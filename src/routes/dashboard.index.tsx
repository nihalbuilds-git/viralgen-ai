import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageSquare, Megaphone, Package, ImageIcon, TrendingUp, Zap, Clock,
  ArrowRight, Sparkles, FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getMyUsage, listGenerations } from "@/lib/generations.functions";
import { getMyProfile } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedCounter } from "@/components/animated-counter";
import { Sparkline } from "@/components/sparkline";
import { UsageMeter } from "@/components/usage-meter";
import { UpgradeModal } from "@/components/upgrade-modal";
import { EmptyState } from "@/components/empty-state";
import { PLAN_BY_ID } from "@/lib/plans";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

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
  return `${Math.floor(h / 24)}d ago`;
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

function dailySeries(items: { created_at: string }[], days = 14): number[] {
  const arr = new Array(days).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const it of items) {
    const d = new Date(it.created_at);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diff >= 0 && diff < days) arr[days - 1 - diff]++;
  }
  return arr;
}

function DashboardHome() {
  const { user } = useAuth();
  const list = useServerFn(listGenerations);
  const getProfile = useServerFn(getMyProfile);
  const getUsage = useServerFn(getMyUsage);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const { data: generations, isLoading } = useQuery({
    queryKey: ["generations"],
    queryFn: () => list({ data: { limit: 100 } }),
  });
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const { data: usage } = useQuery({ queryKey: ["usage"], queryFn: () => getUsage() });

  const plan = usage?.plan ?? PLAN_BY_ID.free;
  const all = generations ?? [];
  const wordCount = all.reduce(
    (acc, g) => acc + JSON.stringify(g.output ?? {}).split(/\s+/).filter(Boolean).length,
    0,
  );
  const hoursSaved = Math.round(all.length * 0.25);
  const avgViral = 78; // mock score
  const series = dailySeries(all);

  const stats = [
    { label: "Total Generated", value: all.length, icon: Zap, suffix: "" },
    { label: "Avg Viral Score", value: avgViral, icon: TrendingUp, suffix: "/100" },
    { label: "Words Written", value: wordCount, icon: FileText, suffix: "" },
    { label: "Hours Saved", value: hoursSaved, icon: Clock, suffix: "h" },
  ];

  const recent = all.slice(0, 8);
  const name = profile?.display_name || user?.email?.split("@")[0] || "there";
  const overLimit = Boolean(
    usage &&
      ((plan.monthlyGenerations > 0 && usage.textUsed >= plan.monthlyGenerations) ||
        (plan.monthlyImages > 0 && usage.imageUsed >= plan.monthlyImages)),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome back, {name} 👋</h1>
          <p className="mt-1 text-muted-foreground">Let's create something that travels today.</p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="h-3 w-3" /> {plan.name} plan
        </Badge>
      </div>

      {/* Analytics with sparklines */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60 bg-gradient-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                  <s.icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="mt-3 font-display text-2xl font-bold">
                <AnimatedCounter value={s.value} />
                <span className="text-base font-normal text-muted-foreground">{s.suffix}</span>
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="-mx-1 mt-2">
                <Sparkline data={series} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Usage */}
      <Card className="border-border/60 bg-gradient-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Monthly usage</h3>
            <p className="text-sm text-muted-foreground">Resets on the 1st of each month.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setUpgradeOpen(true)}>
            Upgrade
          </Button>
        </div>
        <div className="space-y-4">
          <UsageMeter
            label="Text generations"
            used={usage?.textUsed ?? 0}
            limit={plan.monthlyGenerations}
            hint="Captions, ad copy, and product descriptions"
          />
          <UsageMeter
            label="AI images"
            used={usage?.imageUsed ?? 0}
            limit={plan.monthlyImages}
            hint="High-resolution marketing visuals"
          />
        </div>
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

      {/* Recent activity */}
      <Card className="border-border/60 bg-gradient-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Recent activity</h3>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No activity yet"
            description="Generate your first piece of content to see your activity stream here."
            ctaLabel="Try Caption Generator"
            ctaTo="/dashboard/caption"
          />
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

      <UpgradeModal
        open={upgradeOpen || overLimit}
        onOpenChange={setUpgradeOpen}
        reason={overLimit ? "You've reached your Free plan monthly limit." : undefined}
      />
    </div>
  );
}
