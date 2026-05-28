import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const stats = [
  { label: "Generations this month", value: "1,284", icon: Zap, change: "+12%" },
  { label: "Words created", value: "84,520", icon: TrendingUp, change: "+34%" },
  { label: "Avg. time saved", value: "26 hrs", icon: Clock, change: "+8%" },
];

const tools = [
  { title: "Caption Generator", desc: "Scroll-stopping social captions", url: "/dashboard/caption", icon: MessageSquare, color: "from-indigo-500 to-purple-500" },
  { title: "Ad Copy", desc: "High-converting ad headlines & body", url: "/dashboard/adcopy", icon: Megaphone, color: "from-fuchsia-500 to-pink-500" },
  { title: "Product Description", desc: "Persuasive product copy", url: "/dashboard/product", icon: Package, color: "from-blue-500 to-cyan-500" },
  { title: "AI Image Generator", desc: "Marketing visuals from text", url: "/dashboard/image", icon: ImageIcon, color: "from-purple-500 to-pink-500" },
];

const recent = [
  { type: "Caption", text: "✨ Sundays were made for slow coffee and slower scrolls…", time: "2h ago" },
  { type: "Ad copy", text: "Tired of bloated dashboards? Meet Atlas — analytics that respect your time.", time: "5h ago" },
  { type: "Product", text: "The Aero hoodie blends merino warmth with featherweight comfort…", time: "Yesterday" },
];

function DashboardHome() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Welcome back, Jane 👋</h1>
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
              <span className="text-xs font-medium text-primary">{s.change}</span>
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
            <p className="text-sm text-muted-foreground">1,284 of 5,000 generations used</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/pricing">Upgrade</Link>
          </Button>
        </div>
        <Progress value={26} className="mt-4 h-2" />
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
        <ul className="divide-y divide-border/60">
          {recent.map((r, i) => (
            <li key={i} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{r.type}</span>
                <p className="mt-2 line-clamp-1 text-sm">{r.text}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{r.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
