import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ViralGen AI" },
      { name: "description", content: "Simple, transparent pricing for creators and teams." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  { name: "Starter", price: "$0", desc: "For trying things out", features: ["50 generations / mo", "Captions, ad copy & SEO", "Community support"], cta: "Start free", featured: false },
  { name: "Pro", price: "$29", desc: "For solo creators & marketers", features: ["Unlimited text generations", "100 AI images / mo", "All tools unlocked", "Brand voice memory", "Priority support"], cta: "Go Pro", featured: true },
  { name: "Team", price: "$79", desc: "For growing teams", features: ["Everything in Pro", "5 seats", "Shared brand voices", "API access", "SSO & advanced security"], cta: "Contact sales", featured: false },
];

const faqs = [
  { q: "Can I switch plans later?", a: "Yes — upgrade or downgrade at any time. Changes prorate automatically." },
  { q: "What counts as a generation?", a: "Each AI text output or image counts as one generation." },
  { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee on all paid plans." },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Sparkles className="h-3 w-3" /> Simple pricing
          </Badge>
          <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
            Plans that scale with your <span className="text-gradient">ambition</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 px-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={`relative p-8 ${p.featured ? "border-primary/50 bg-gradient-card shadow-glow" : "border-border/60 bg-gradient-card"}`}
            >
              {p.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">Most popular</Badge>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-5 font-display text-4xl font-bold">
                {p.price}
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className={`mt-8 w-full ${p.featured ? "bg-gradient-primary shadow-glow hover:opacity-90" : ""}`} variant={p.featured ? "default" : "outline"}>
                <Link to="/dashboard">{p.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Frequently asked</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <Card key={f.q} className="border-border/60 bg-gradient-card p-6">
                <h3 className="font-display font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
