import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shield, Users, Sparkles, Activity, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  adminGetStats,
  adminListGenerations,
  adminListUsers,
  getIsAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ViralGen AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const isAdminFn = useServerFn(getIsAdmin);
  const statsFn = useServerFn(adminGetStats);
  const usersFn = useServerFn(adminListUsers);
  const gensFn = useServerFn(adminListGenerations);

  const { data: gate, isLoading: gateLoading } = useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: () => isAdminFn(),
  });

  const enabled = gate?.isAdmin === true;

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => statsFn(),
    enabled,
  });
  const { data: users } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => usersFn({ data: { limit: 50 } }),
    enabled,
  });
  const { data: gens } = useQuery({
    queryKey: ["admin", "generations"],
    queryFn: () => gensFn({ data: { limit: 50 } }),
    enabled,
  });

  if (gateLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <EmptyState
        icon={Shield}
        title="Admins only"
        description="Your account doesn't have admin access. Ask an existing admin to grant you the role."
        ctaLabel="Back to dashboard"
        ctaTo="/dashboard"
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Admin</h1>
          <p className="text-muted-foreground">
            Operations & abuse monitoring across all workspaces.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Users" value={stats?.users} />
        <StatCard icon={Sparkles} label="Generations (total)" value={stats?.generationsTotal} />
        <StatCard icon={Activity} label="Generations (24h)" value={stats?.generations24h} />
        <StatCard icon={TrendingUp} label="Generations (7d)" value={stats?.generations7d} />
      </div>

      {stats && (
        <Card className="border-border/60 bg-gradient-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Plan distribution
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(stats.planCounts).length === 0 ? (
              <span className="text-sm text-muted-foreground">No subscriptions yet.</span>
            ) : (
              Object.entries(stats.planCounts).map(([plan, count]) => (
                <Badge key={plan} variant="outline" className="capitalize">
                  {plan}: {count}
                </Badge>
              ))
            )}
          </div>
        </Card>
      )}

      <Card className="border-border/60 bg-gradient-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Generations</th>
                <th className="py-2 pr-4">Avg viral</th>
                <th className="py-2 pr-4">Last active</th>
                <th className="py-2 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id} className="border-t border-border/40">
                  <td className="py-2 pr-4">
                    <div className="font-medium">{u.displayName ?? "—"}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {u.id.slice(0, 8)}…
                    </div>
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant="outline" className="capitalize">
                      {u.planId}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">{u.generations}</td>
                  <td className="py-2 pr-4">{u.avgViral ?? "—"}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {u.lastGeneration
                      ? new Date(u.lastGeneration).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border-border/60 bg-gradient-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recent generations
        </h2>
        <div className="space-y-2">
          {(gens ?? []).map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {g.type}
                  </Badge>
                  {typeof g.viral_score === "number" && (
                    <Badge variant="outline" className="text-[10px]">
                      Viral {g.viral_score}
                    </Badge>
                  )}
                  <span className="truncate">{g.title}</span>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  user {g.user_id.slice(0, 8)}… · {new Date(g.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {(gens ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No generations yet.</p>
          )}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Need to grant admin?{" "}
        <Link to="/dashboard" className="underline">
          Insert a row into <code>user_roles</code> with role <code>admin</code>.
        </Link>
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | undefined;
}) {
  return (
    <Card className="border-border/60 bg-gradient-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold">
        {value === undefined ? "—" : value.toLocaleString()}
      </div>
    </Card>
  );
}
