import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileTabBar } from "@/components/mobile-tabbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Loader2, Gauge } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { UsageDialog } from "@/components/usage-dialog";
import { OnboardingModal } from "@/components/onboarding-modal";
import { UsageWarningWatcher } from "@/hooks/use-usage-warning";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ViralGen AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [usageOpen, setUsageOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const initials = (user.user_metadata?.display_name || user.email || "U")
    .toString()
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            <div className="flex items-center gap-2">
              <div className="hidden md:block"><SidebarTrigger /></div>
              <span className="font-display text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Workspace</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUsageOpen(true)}
                className="hidden gap-1.5 hover:bg-accent/60 sm:inline-flex"
                title="View usage"
              >
                <Gauge className="h-4 w-4" />
                <span className="text-xs font-medium">Usage</span>
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent/60 sm:hidden" onClick={() => setUsageOpen(true)} title="Usage">
                <Gauge className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent/60">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out" className="hover:bg-accent/60">
                <LogOut className="h-4 w-4" />
              </Button>
              <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground shadow-glow ring-2 ring-background">
                {initials}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileTabBar />
      <UsageDialog open={usageOpen} onOpenChange={setUsageOpen} />
      <OnboardingModal />
      <UsageWarningWatcher />
    </SidebarProvider>
  );
}
