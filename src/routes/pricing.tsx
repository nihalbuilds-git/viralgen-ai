import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PLANS } from "@/lib/plans";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ViralGen AI" },
      { name: "description", content: "Simple, transparent pricing for creators and teams." },
    ],
  }),
  component: PricingPage,
});

const comparison = [
  { label: "Monthly text generations", values: ["50", "2,000", "Unlimited"] },
  { label: "Monthly AI images", values: ["5", "100", "1,000"] },
  { label: "Caption Generator", values: [true, true, true] },
  { label: "Ad Copy Generator", values: [true, true, true] },
  { label: "Product Descriptions", values: [true, true, true] },
  { label: "AI Image Generator", values: [true, true, true] },
  { label: "Export as .txt / .pdf", values: [false, true, true] },
  { label: "Brand voice memory", values: [false, true, true] },
  { label: "Prompt templates", values: [true, true, true] },
  { label: "Analytics dashboard", values: [false, true, true] },
  { label: "Priority support", values: [false, true, true] },
  { label: "API access", values: [false, false, true] },
  { label: "SSO & advanced security", values: [false, false, true] },
];

const faqs = [
  { q: "Can I switch plans later?", a: "Yes — upgrade or downgrade at any time. Changes prorate automatically." },
  { q: "What counts as a generation?", a: "Each AI text output or image counts as one generation." },
  { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee on all paid plans." },
];

function Cell({ v }: { v: string | boolean }) {
  if (typeof v === "boolean") {
    return v ? <Check className="mx-auto h-4 w-4 text-primary" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />;
  }
  return <span className="text-sm font-medium">{v}</span>;
}

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
          {PLANS.map((p) => (
            <Card
              key={p.id}
              className={`relative p-8 ${p.featured ? "border-primary/50 bg-gradient-card shadow-glow" : "border-border/60 bg-gradient-card"}`}
            >
              {p.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">Most popular</Badge>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <div className="mt-5 font-display text-4xl font-bold">
                {p.price}<span className="text-base font-normal text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2 text-sm">
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={f.included ? "" : "text-muted-foreground line-through"}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className={`mt-8 w-full ${p.featured ? "bg-gradient-primary shadow-glow hover:opacity-90" : ""}`} variant={p.featured ? "default" : "outline"}>
                <Link to="/dashboard">{p.id === "enterprise" ? "Contact sales" : p.id === "pro" ? "Go Pro" : "Start free"}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Compare every feature</h2>
          <Card className="mt-10 overflow-hidden border-border/60 bg-gradient-card p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-accent/30">
                    <th className="px-4 py-4 text-left font-display font-semibold">Feature</th>
                    {PLANS.map((p) => (
                      <th key={p.id} className="px-4 py-4 text-center font-display font-semibold">
                        {p.name}
                        {p.featured && <Badge className="ml-2 bg-gradient-primary text-[10px]">Popular</Badge>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={row.label} className={i % 2 ? "bg-background/30" : ""}>
                      <td className="px-4 py-3 text-left">{row.label}</td>
                      {row.values.map((v, j) => (
                        <td key={j} className="px-4 py-3 text-center">
                          <Cell v={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
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
