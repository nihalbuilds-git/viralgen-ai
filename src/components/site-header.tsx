import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border/40 glass-strong"
          : "border-b border-transparent bg-background/0 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow"
          >
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </motion.div>
          <span className="font-display text-xl font-bold tracking-tight">ViralGen AI</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "#features", label: "Features" },
            { href: "#how", label: "How it works" },
            { href: "#testimonials", label: "Testimonials" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/pricing"
            className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="btn-shine bg-gradient-primary shadow-glow hover:opacity-95"
          >
            <Link to="/dashboard">Get started</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
