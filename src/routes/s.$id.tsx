import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Sparkles, ArrowRight, MessageSquare, Megaphone, Package, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { getPublicGeneration } from "@/lib/share.functions";

const TYPE_META: Record<string, { icon: typeof Sparkles; label: string }> = {
  caption: { icon: MessageSquare, label: "Caption" },
  adcopy: { icon: Megaphone, label: "Ad Copy" },
  product: { icon: Package, label: "Product Description" },
  image: { icon: ImageIcon, label: "AI Image" },
};

function plainText(type: string, output: Record<string, unknown>): string {
  if (type === "caption" && Array.isArray(output.captions)) {
    return (output.captions as string[]).join("\n\n");
  }
  if (type === "adcopy") {
    return [output.headline, output.primaryText, output.cta].filter(Boolean).join("\n\n");
  }
  if (type === "product" && typeof output.description === "string") {
    return output.description;
  }
  return "";
}

export const Route = createFileRoute("/s/$id")({
  loader: async ({ params }) => {
    const row = await getPublicGeneration({ data: { id: params.id } });
    if (!row) throw notFound();
    return { generation: row };
  },
  head: ({ loaderData, params }) => {
    const g = loaderData?.generation;
    const title = g ? `${g.title} — ViralGen AI` : "Shared content — ViralGen AI";
    const desc = g
      ? plainText(g.type, (g.output ?? {}) as Record<string, unknown>).slice(0, 160) ||
        "AI-generated marketing content shared with ViralGen AI."
      : "Shared content";
    const imageUrl =
      g?.type === "image"
        ? (g.output as { imageUrl?: string } | null)?.imageUrl ?? undefined
        : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/s/${params.id}` },
        ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
        { name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
      ],
      links: [{ rel: "canonical", href: `/s/${params.id}` }],
    };
  },
  component: SharePage,
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold">Link not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This share link is private or has been removed.
        </p>
        <Button asChild className="mt-6 bg-gradient-primary shadow-glow">
          <Link to="/">Try ViralGen AI</Link>
        </Button>
      </div>
    </div>
  ),
});

function SharePage() {
  const { generation } = Route.useLoaderData();
  const meta = TYPE_META[generation.type] ?? { icon: Sparkles, label: "Content" };
  const Icon = meta.icon;
  const output = (generation.output ?? {}) as Record<string, unknown>;
  const text = plainText(generation.type, output);

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary shadow-glow">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold">ViralGen AI</span>
          </Link>
          <Button asChild size="sm" className="bg-gradient-primary shadow-glow">
            <Link to="/">
              Try it free <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{meta.label}</p>
            <h1 className="font-display text-2xl font-bold leading-tight">{generation.title}</h1>
          </div>
        </div>

        {generation.type === "image" ? (
          <Card className="overflow-hidden rounded-2xl border-border/60 p-0">
            {(output.imageUrl as string | undefined) ? (
              <img
                src={output.imageUrl as string}
                alt={generation.title}
                className="h-auto w-full object-contain"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-muted-foreground">
                Image unavailable
              </div>
            )}
          </Card>
        ) : generation.type === "caption" && Array.isArray(output.captions) ? (
          <div className="space-y-3">
            {(output.captions as string[]).map((c, i) => (
              <Card key={i} className="flex items-start justify-between gap-3 rounded-2xl border-border/60 bg-card/60 p-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{c}</p>
                <CopyButton text={c} />
              </Card>
            ))}
          </div>
        ) : generation.type === "adcopy" ? (
          <div className="space-y-3">
            {(["headline", "primaryText", "cta"] as const).map((k) => {
              const value = output[k];
              if (typeof value !== "string") return null;
              return (
                <Card key={k} className="rounded-2xl border-border/60 bg-card/60 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                    {k === "primaryText" ? "Primary text" : k === "cta" ? "Call to action" : "Headline"}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-2xl border-border/60 bg-card/60 p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
          </Card>
        )}

        <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 text-center">
          <p className="font-display text-lg font-semibold">Make content like this in seconds</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ViralGen AI generates on-brand captions, ad copy, product descriptions and images.
          </p>
          <Button asChild className="mt-4 bg-gradient-primary shadow-glow">
            <Link to="/">Start free</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
