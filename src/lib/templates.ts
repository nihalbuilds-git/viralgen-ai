import {
  Zap,
  List,
  BookOpen,
  MousePointerClick,
  HelpCircle,
  Megaphone,
  Package,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";

export type Category = "Marketing" | "Educational" | "Entertainment" | "Personal Brand";

export type ToolTarget = "caption" | "adcopy" | "product" | "image";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: LucideIcon;
  prompt: string;
  example: string;
  /** Which generator this template prefills. */
  tool: ToolTarget;
  /** Field values to prefill on the target tool (becomes URL search params). */
  prefill: Record<string, string>;
}

export const CATEGORIES: Category[] = [
  "Marketing",
  "Educational",
  "Entertainment",
  "Personal Brand",
];

export const TEMPLATES: Template[] = [
  {
    id: "hook",
    name: "Hook caption",
    description: "Scroll-stopping opening line that grabs attention in the first 3 seconds.",
    category: "Marketing",
    icon: Zap,
    tool: "caption",
    prefill: {
      platform: "Instagram",
      product: "Open with a surprising, specific stat about our product or topic.",
      tone: "bold",
      audience: "Scrollers who haven't heard of us yet",
    },
    prompt:
      "Write a 1-line hook for {topic} aimed at {audience}. Make it surprising, specific, and impossible to scroll past.",
    example:
      "Most people lose $4,000/year because of this one tax mistake — and your accountant won't tell you.",
  },
  {
    id: "listicle",
    name: "Listicle caption",
    description: "Numbered list that's highly skimmable and shareable.",
    category: "Educational",
    icon: List,
    tool: "caption",
    prefill: {
      platform: "LinkedIn",
      product: "5 surprising lessons from launching our product",
      tone: "engaging",
      audience: "Founders and operators",
    },
    prompt:
      "Write a numbered list of 5 surprising facts about {topic}. Each item must be 1-2 sentences and feel like an insider tip.",
    example:
      "5 things nobody tells you about launching a SaaS: 1. Your first 10 customers will all churn…",
  },
  {
    id: "storytelling",
    name: "Storytelling caption",
    description: "Narrative arc with tension and resolution that emotionally engages.",
    category: "Entertainment",
    icon: BookOpen,
    tool: "caption",
    prefill: {
      platform: "TikTok",
      product: "A short before / turning-point / after story about our brand or customer",
      tone: "inspirational",
      audience: "People in a similar starting situation",
    },
    prompt:
      "Tell a 60-second story about {topic} for {audience}. Use a clear before / turning-point / after structure.",
    example:
      "Two years ago I was sleeping on a friend's couch. Yesterday I sold my company for $4M. Here's what changed…",
  },
  {
    id: "cta-ad",
    name: "CTA-first ad",
    description: "Lead with the action you want the reader to take.",
    category: "Marketing",
    icon: MousePointerClick,
    tool: "adcopy",
    prefill: {
      product: "Our flagship product",
      audience: "Warm leads who've seen us before",
      offer: "Limited-time 20% off — ends Sunday",
      tone: "urgent",
    },
    prompt:
      "Write copy for {topic} that opens with a strong call to action and only then explains the value.",
    example:
      "Bookmark this. In 60 seconds you'll know exactly how to price your next freelance project…",
  },
  {
    id: "question",
    name: "Question-based caption",
    description: "Open with a question that demands the audience's own answer.",
    category: "Personal Brand",
    icon: HelpCircle,
    tool: "caption",
    prefill: {
      platform: "LinkedIn",
      product: "A thought-provoking question + 3-sentence answer on our category",
      tone: "professional",
      audience: "Industry peers",
    },
    prompt:
      "Open with a thought-provoking question about {topic}, then deliver a 3-sentence answer.",
    example: "What if the reason you're stuck isn't your strategy — it's your standards?",
  },
  {
    id: "ecom-launch",
    name: "Ecommerce launch ad",
    description: "Headline + body + CTA for a new product drop.",
    category: "Marketing",
    icon: Megaphone,
    tool: "adcopy",
    prefill: {
      product: "Premium merino wool hoodie",
      audience: "Outdoor enthusiasts aged 25-45",
      offer: "Free shipping on first orders over $50",
      tone: "persuasive",
    },
    prompt: "Write a high-converting launch ad for {topic}.",
    example: "Sleep better tonight — 30% off, today only.",
  },
  {
    id: "feature-bullets",
    name: "Feature-led product copy",
    description: "SEO product description led by benefits and features.",
    category: "Marketing",
    icon: Package,
    tool: "product",
    prefill: {
      name: "Pulse Pro Earbuds",
      features: "active noise cancellation, 36-hour battery, IPX5, multipoint Bluetooth",
      audience: "Commuters and remote workers",
    },
    prompt: "Write a SEO product description for {topic}.",
    example: "Pulse Pro Earbuds deliver studio-grade sound wherever you roam…",
  },
  {
    id: "hero-image",
    name: "Hero product image",
    description: "Clean studio shot for landing pages and ads.",
    category: "Marketing",
    icon: ImageIcon,
    tool: "image",
    prefill: {
      prompt:
        "A matte black water bottle on a soft pastel gradient backdrop, studio lighting",
      style: "realistic",
      ratio: "1:1",
    },
    prompt: "Generate a hero product image for {topic}.",
    example: "Studio-lit product photo with soft pastel background.",
  },
];
