import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, History, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/dashboard/templates", label: "Templates", icon: Sparkles },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function MobileTabBar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(it.to);
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <it.icon className="h-5 w-5" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
