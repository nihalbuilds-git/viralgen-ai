import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Zap,
  Wand2,
  ImageIcon,
  MessageSquare,
  Megaphone,
  Package,
  Search,
  Hash,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: MessageSquare, title: "Social Captions", desc: "Scroll-stopping captions tuned for every platform." },
  { icon: Megaphone, title: "Ad Copy", desc: "High-converting ads written for your audience." },
  { icon: Package, title: "Product Descriptions", desc: "Persuasive copy that turns browsers into buyers." },
  { icon: Search, title: "SEO Titles", desc: "Rank higher with keyword-rich, click-worthy titles." },
  { icon: ImageIcon, title: "AI Images", desc: "Generate stunning marketing visuals in seconds." },
  { icon: Hash, title: "Instagram Hashtags", desc: "Reach the right audience with smart hashtag sets." },
];

const steps = [
  { n: "01", title: "Describe your idea", desc: "Tell us what you're promoting in plain language." },
  { n: "02", title: "Pick your tool", desc: "Captions, ads, product copy, images — pick your weapon." },
  { n: "03", title: "Generate & publish", desc: "Get on-brand variants ready to ship in seconds." },
];

const testimonials = [
  { name: "Sarah K.", role: "DTC Founder", text: "ViralGen cut my content workflow from hours to minutes. Our ROAS is up 38%." },
  { name: "Mateo R.", role: "Growth Marketer", text: "The ad copy generator alone is worth the subscription. Insanely good." },
  { name: "Priya S.", role: "Creator", text: "I post 4x more now. The captions actually sound like me, just sharper." },
];

const plans = [
  { name: "Starter", price: "$0", desc: "For trying things out", features: ["50 generations / mo", "Basic tools", "Community support"], cta: "Start free", featured: false },
  { name: "Pro", price: "$29", desc: "For solo creators & marketers", features: ["Unlimited text generations", "100 AI images / mo", "All tools unlocked", "Priority support"], cta: "Go Pro", featured: true },
  { name: "Team", price: "$79", desc: "For growing teams", features: ["Everything in Pro", "5 seats", "Brand voice training", "API access"], cta: "Contact sales", featured: false },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5">
              <Sparkles className="h-3 w-3" /> Powered by frontier AI models
            </Badge>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
              Marketing content that{" "}
              <span className="text-gradient">goes viral</span>, on demand.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Captions, ad copy, product descriptions, SEO titles, and AI images — generated in seconds, tuned to your brand.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-primary shadow-glow hover:opacity-90">
                <Link to="/dashboard">
                  Start generating <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> Free plan forever</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> Cancel anytime</span>
            </div>
          </div>

          {/* Hero visual grid */}
          <div className="mx-auto mt-20 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              { icon: Wand2, label: "Captions", value: '"Sunsets are free therapy 🌅✨"' },
              { icon: Megaphone, label: "Ad headline", value: '"Sleep better tonight — 30% off"' },
              { icon: ImageIcon, label: "Image prompt", value: '"Studio portrait, neon rim light"' },
            ].map((c, i) => (
              <Card
                key={i}
                className="animate-slide-up border-border/60 bg-gradient-card p-5 shadow-elegant backdrop-blur"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <c.icon className="h-3.5 w-3.5 text-primary" /> {c.label}
                </div>
                <p className="font-display text-base">{c.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="font-display text-4xl font-bold md:text-5xl">Every tool a modern marketer needs</h2>
            <p className="mt-4 text-muted-foreground">Stop juggling six apps. Generate every asset from one workspace.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="group border-border/60 bg-gradient-card p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/60 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">How it works</Badge>
            <h2 className="font-display text-4xl font-bold md:text-5xl">From blank page to publish in 30 seconds</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border/60 bg-gradient-card p-8">
                <div className="font-display text-5xl font-bold text-gradient">{s.n}</div>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-border/60 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Loved by 10,000+ marketers</Badge>
            <h2 className="font-display text-4xl font-bold md:text-5xl">Real results, real fast</h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border/60 bg-gradient-card p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/60 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="font-display text-4xl font-bold md:text-5xl">Simple plans, serious leverage</h2>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={`relative p-8 ${
                  p.featured
                    ? "border-primary/50 bg-gradient-card shadow-glow"
                    : "border-border/60 bg-gradient-card"
                }`}
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
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 py-24">
        <div className="container mx-auto px-6">
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-card p-12 text-center shadow-glow md:p-16">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold md:text-5xl">Ready to 10x your content?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Join thousands of creators shipping more, faster, with ViralGen AI.</p>
            <Button asChild size="lg" className="mt-8 bg-gradient-primary shadow-glow hover:opacity-90">
              <Link to="/dashboard">Start generating free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
