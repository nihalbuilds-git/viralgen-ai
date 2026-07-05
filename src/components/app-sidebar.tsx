import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard, MessageSquare, Megaphone, Package, ImageIcon,
  User, Sparkles, CreditCard, History, Star, BarChart3, Settings, LayoutTemplate, Users, Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { getIsAdmin } from "@/lib/admin.functions";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Templates", url: "/dashboard/templates", icon: LayoutTemplate },
  { title: "History", url: "/dashboard/history", icon: History },
  { title: "Favorites", url: "/dashboard/favorites", icon: Star },
];

const aiTools = [
  { title: "Caption Generator", url: "/dashboard/caption", icon: MessageSquare },
  { title: "Ad Copy", url: "/dashboard/adcopy", icon: Megaphone },
  { title: "Product Description", url: "/dashboard/product", icon: Package },
  { title: "Image Generator", url: "/dashboard/image", icon: ImageIcon },
];

const account = [
  { title: "Brand Profiles", url: "/dashboard/brand-profiles", icon: Users },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Pricing", url: "/pricing", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isAdminFn = useServerFn(getIsAdmin);
  const { data: adminGate } = useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: () => isAdminFn(),
    staleTime: 5 * 60 * 1000,
  });

  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(url);

  const renderGroup = (label: string, items: { title: string; url: string; icon: any }[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className={`group relative h-9 rounded-lg transition-all ${
                    active
                      ? "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent font-medium text-foreground"
                      : "hover:bg-sidebar-accent/60"
                  }`}
                >
                  <Link to={item.url} className="relative">
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-primary shadow-glow"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={`h-4 w-4 transition-colors ${
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <Link to="/" className="group flex items-center gap-2.5 px-2 py-3">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow"
          >
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </motion.div>
          {!collapsed && (
            <span className="font-display text-lg font-bold tracking-tight">ViralGen</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {renderGroup("Workspace", mainItems)}
        {renderGroup("AI Tools", aiTools)}
        {renderGroup("Account", account)}
        {adminGate?.isAdmin &&
          renderGroup("Admin", [
            { title: "Operations", url: "/dashboard/admin", icon: Shield },
          ])}
      </SidebarContent>
    </Sidebar>
  );
}
