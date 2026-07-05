import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getMyUsage } from "@/lib/generations.functions";

const WARN_THRESHOLD = 0.8;
const SESSION_KEY_PREFIX = "viralgen_usage_warned_";

// Polls current usage and fires a one-shot toast when a meter crosses 80%
// in the current billing period — so users get a soft heads-up before
// hitting a hard limit.
export function useUsageWarning() {
  const fn = useServerFn(getMyUsage);
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["usage"],
    queryFn: () => fn(),
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!data || typeof window === "undefined") return;
    const periodKey = data.periodStart.slice(0, 7); // YYYY-MM
    const check = (kind: "text" | "image", used: number, limit: number) => {
      if (limit === -1) return;
      const pct = used / Math.max(limit, 1);
      if (pct < WARN_THRESHOLD || pct >= 1) return;
      const key = `${SESSION_KEY_PREFIX}${kind}_${periodKey}`;
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
      const remaining = Math.max(limit - used, 0);
      toast.warning(
        `${remaining} ${kind === "image" ? "AI images" : "text generations"} left this period`,
        {
          description: "Upgrade to keep going without interruption.",
          action: {
            label: "View plans",
            onClick: () => {
              navigate({ to: "/pricing" });
            },
          },
          duration: 8000,
        },
      );
    };
    check("text", data.textUsed, data.plan.monthlyGenerations);
    check("image", data.imageUsed, data.plan.monthlyImages);
  }, [data, navigate]);
}

// Wrapper component so the hook can be mounted from any layout.
export function UsageWarningWatcher() {
  useUsageWarning();
  return null;
}

// Re-export Link so consumers don't add an extra import.
export { Link };

