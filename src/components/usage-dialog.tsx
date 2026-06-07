import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Gauge, Sparkles, Image as ImageIcon, MessageSquare, Loader2, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getMyUsage } from "@/lib/generations.functions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function format(n: number, limit: number) {
  return `${n.toLocaleString()} / ${limit === -1 ? "∞" : limit.toLocaleString()}`;
}

function nextPeriodStart(periodStart: string) {
  const d = new Date(periodStart);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

export function UsageDialog({ open, onOpenChange }: Props) {
  const fn = useServerFn(getMyUsage);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["usage"],
    queryFn: () => fn(),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Gauge className="h-5 w-5 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">Your usage</DialogTitle>
          <DialogDescription className="text-center">
            Real-time counts for this billing period.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-accent/30 p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Current plan
                </p>
                <p className="font-display text-lg font-semibold">{data.plan.name}</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                {data.plan.price}/mo
              </Badge>
            </div>

            <UsageRow
              icon={MessageSquare}
              label="Text generations"
              used={data.textUsed}
              limit={data.plan.monthlyGenerations}
            />
            <UsageRow
              icon={ImageIcon}
              label="AI images"
              used={data.imageUsed}
              limit={data.plan.monthlyImages}
            />

            <p className="text-center text-xs text-muted-foreground">
              Resets{" "}
              {nextPeriodStart(data.periodStart).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Refresh
          </Button>
          {data?.plan.id !== "enterprise" && (
            <Button asChild className="bg-gradient-primary shadow-glow hover:opacity-95">
              <Link to="/pricing" onClick={() => onOpenChange(false)}>
                <Crown className="mr-1.5 h-3.5 w-3.5" />
                Upgrade
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UsageRow({
  icon: Icon,
  label,
  used,
  limit,
}: {
  icon: typeof Gauge;
  label: string;
  used: number;
  limit: number;
}) {
  const unlimited = limit === -1;
  const pct = unlimited ? 8 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const danger = !unlimited && pct >= 90;
  const warn = !unlimited && pct >= 70 && pct < 90;
  const remaining = unlimited ? "Unlimited" : `${Math.max(limit - used, 0).toLocaleString()} left`;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Icon className="h-4 w-4 text-primary" />
          {label}
        </span>
        <span className="text-muted-foreground">{format(used, limit)}</span>
      </div>
      <Progress
        value={pct}
        className={`h-2 ${danger ? "[&>div]:bg-destructive" : warn ? "[&>div]:bg-amber-500" : ""}`}
      />
      <p className="mt-1 text-xs text-muted-foreground">{remaining}</p>
    </div>
  );
}
