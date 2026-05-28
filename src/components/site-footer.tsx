import { Link } from "@tanstack/react-router";
import { Sparkles, Github, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30 backdrop-blur">
      <div className="container mx-auto grid gap-10 px-6 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">ViralGen AI</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            AI-powered marketing content that converts. Built for creators, marketers, and brands.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Tools</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/dashboard/caption" className="hover:text-foreground">Captions</Link></li>
            <li><Link to="/dashboard/adcopy" className="hover:text-foreground">Ad Copy</Link></li>
            <li><Link to="/dashboard/image" className="hover:text-foreground">AI Images</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Connect</h4>
          <div className="flex gap-3">
            <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ViralGen AI. Crafted with intent.
      </div>
    </footer>
  );
}
