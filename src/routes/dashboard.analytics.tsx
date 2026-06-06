import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, TrendingUp, FileText, Zap, Clock } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { AnimatedCounter } from "@/components/animated-counter";
import { getAnalytics } from "@/lib/generations.functions";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

const TYPE_COLORS: Record<string, string> = {
  caption: "hsl(265, 80%, 65%)",
  adcopy: "hsl(320, 80%, 65%)",
  product: "hsl(200, 80%, 60%)",
  image: "hsl(280, 80%, 60%)",
};

function AnalyticsPage() {
  const analyticsFn = useServerFn(getAnalytics);
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsFn(),
  });

  const totals = data?.totals ?? [];
  const daily = data?.daily ?? [];
  const radar = data?.quality ?? [];

  const stats = [
    { label: "Total Generated", value: data?.totalGenerations ?? 0, icon: Zap, suffix: "" },
    { label: "Avg Viral Score", value: data?.avgViral ?? 0, icon: TrendingUp, suffix: "/100" },
    { label: "Words Written", value: data?.totalWords ?? 0, icon: FileText, suffix: "" },
    { label: "Hours Saved", value: data?.hoursSaved ?? 0, icon: Clock, suffix: "h" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <BarChart3 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track output, themes, and momentum.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !data || data.totalGenerations === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No data to chart yet"
          description="Generate a few pieces of content and your analytics will populate here."
          ctaLabel="Open Caption Generator"
          ctaTo="/dashboard/caption"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className="border-border/60 bg-gradient-card p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                  <s.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="mt-3 font-display text-2xl font-bold">
                  <AnimatedCounter value={s.value} />
                  <span className="text-base font-normal text-muted-foreground">{s.suffix}</span>
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/60 bg-gradient-card p-5">
              <h3 className="mb-4 font-display font-semibold">Generations over time</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={daily}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.4} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="generations"
                    stroke="hsl(265, 80%, 65%)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="border-border/60 bg-gradient-card p-5">
              <h3 className="mb-4 font-display font-semibold">Words per day</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={daily}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="words" fill="hsl(320, 80%, 65%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="border-border/60 bg-gradient-card p-5">
              <h3 className="mb-4 font-display font-semibold">Content quality</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radar} outerRadius={90}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar dataKey="score" stroke="hsl(265, 80%, 65%)" fill="hsl(265, 80%, 65%)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="border-border/60 bg-gradient-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-semibold">Content mix</h3>
                <Badge variant="secondary">{data.totalGenerations} total</Badge>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={totals} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                    {totals.map((entry) => (
                      <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? "hsl(var(--primary))"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
