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
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuroraBackground } from "@/components/aurora-background";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <AuroraBackground />
        <div className="container relative mx-auto px-6 py-24 md:py-32">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={fadeUp}>
              <Badge
                variant="secondary"
                className="mb-6 gap-1.5 rounded-full border border-border/60 bg-background/40 px-3.5 py-1.5 backdrop-blur"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Powered by frontier AI models
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl font-bold tracking-tight md:text-7xl"
            >
              Marketing content that{" "}
              <span className="text-aurora">goes viral</span>,<br className="hidden md:block" /> on demand.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Captions, ad copy, product descriptions, SEO titles, and AI images — generated in seconds, tuned to your brand.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="btn-shine h-12 rounded-full bg-gradient-primary px-7 text-base shadow-glow hover:opacity-95"
              >
                <Link to="/dashboard">
                  Start generating <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border/60 bg-background/40 px-7 text-base backdrop-blur hover:bg-background/70"
              >
                <Link to="/pricing">See pricing</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> Free plan forever</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> Cancel anytime</span>
            </motion.div>
          </motion.div>

          {/* Hero bento */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2 md:gap-5"
          >
            <BentoCard className="md:col-span-3 md:row-span-2" icon={Wand2} label="Captions">
              <p className="font-display text-2xl leading-snug md:text-3xl">
                "Sunsets are free therapy 🌅✨ Tag someone who needs to see this today."
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[88%] bg-gradient-primary" />
                </div>
                <span>88 / 100 viral score</span>
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-3" icon={Megaphone} label="Ad headline">
              <p className="font-display text-xl">"Sleep better tonight — 30% off, today only."</p>
            </BentoCard>

            <BentoCard className="md:col-span-2" icon={ImageIcon} label="Image prompt">
              <p className="font-display text-base text-muted-foreground">
                Studio portrait, neon rim light
              </p>
            </BentoCard>

            <BentoCard className="md:col-span-1" icon={TrendingUp} label="Trend">
              <p className="font-display text-2xl text-gradient">+38%</p>
              <p className="text-[11px] text-muted-foreground">avg ROAS</p>
            </BentoCard>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/40 py-24">
        <div className="container mx-auto px-6">
          <SectionHeader badge="Features" title="Every tool a modern marketer needs" sub="Stop juggling six apps. Generate every asset from one workspace." />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Card className="group gradient-border hover-lift relative h-full overflow-hidden border-border/40 bg-gradient-card p-6 backdrop-blur">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30" />
                  <div className="relative">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                      <f.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/40 py-24">
        <div className="container mx-auto px-6">
          <SectionHeader badge="How it works" title="From blank page to publish in 30 seconds" />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {steps.map((s) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                className="gradient-border hover-lift relative rounded-2xl border border-border/40 bg-gradient-card p-8 backdrop-blur"
              >
                <div className="font-display text-5xl font-bold text-gradient">{s.n}</div>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-border/40 py-24">
        <div className="container mx-auto px-6">
          <SectionHeader badge="Loved by 10,000+ marketers" title="Real results, real fast" />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-14 grid gap-5 md:grid-cols-3"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <Card className="gradient-border hover-lift h-full border-border/40 bg-gradient-card p-6 backdrop-blur">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">"{t.text}"</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border/40 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/40 py-24">
        <div className="container mx-auto px-6">
          <SectionHeader badge="Pricing" title="Simple plans, serious leverage" />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3"
          >
            {plans.map((p) => (
              <motion.div key={p.name} variants={fadeUp}>
                <Card
                  className={`hover-lift relative h-full overflow-hidden p-8 backdrop-blur ${
                    p.featured
                      ? "border-primary/40 bg-gradient-card shadow-glow"
                      : "gradient-border border-border/40 bg-gradient-card"
                  }`}
                >
                  {p.featured && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary shadow-glow">
                      Most popular
                    </Badge>
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
                  <Button
                    asChild
                    className={`btn-shine mt-8 w-full rounded-full ${
                      p.featured ? "bg-gradient-primary shadow-glow hover:opacity-95" : ""
                    }`}
                    variant={p.featured ? "default" : "outline"}
                  >
                    <Link to="/dashboard">{p.cta}</Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 py-24">
        <div className="container mx-auto px-6">
          <Card className="gradient-border relative overflow-hidden border-primary/30 bg-gradient-card p-12 text-center shadow-glow md:p-16">
            <div className="absolute inset-0 -z-10 bg-gradient-mesh opacity-70" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow"
            >
              <Zap className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <h2 className="mt-6 font-display text-3xl font-bold md:text-5xl">Ready to 10x your content?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of creators shipping more, faster, with ViralGen AI.
            </p>
            <Button
              asChild
              size="lg"
              className="btn-shine mt-8 h-12 rounded-full bg-gradient-primary px-7 shadow-glow hover:opacity-95"
            >
              <Link to="/dashboard">
                Start generating free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeader({ badge, title, sub }: { badge: string; title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl text-center"
    >
      <Badge variant="secondary" className="mb-4 rounded-full border border-border/40 bg-background/40 backdrop-blur">
        {badge}
      </Badge>
      <h2 className="font-display text-4xl font-bold md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

function BentoCard({
  className = "",
  icon: Icon,
  label,
  children,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={`gradient-border hover-lift group relative overflow-hidden border-border/40 bg-gradient-card p-6 backdrop-blur ${className}`}
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-primary opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-25" />
      <div className="relative flex h-full flex-col">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" /> {label}
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </Card>
  );
}
