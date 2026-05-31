import { Zap, List, BookOpen, MousePointerClick, HelpCircle, type LucideIcon } from "lucide-react";

export type Category = "Marketing" | "Educational" | "Entertainment" | "Personal Brand";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: LucideIcon;
  prompt: string;
  example: string;
}

export const CATEGORIES: Category[] = ["Marketing", "Educational", "Entertainment", "Personal Brand"];

export const TEMPLATES: Template[] = [
  {
    id: "hook",
    name: "Hook",
    description: "Scroll-stopping opening line that grabs attention in the first 3 seconds.",
    category: "Marketing",
    icon: Zap,
    prompt:
      "Write a 1-line hook for {topic} aimed at {audience}. Make it surprising, specific, and impossible to scroll past.",
    example: "Most people lose $4,000/year because of this one tax mistake — and your accountant won't tell you.",
  },
  {
    id: "listicle",
    name: "Listicle",
    description: "Numbered list format that's highly skimmable and shareable.",
    category: "Educational",
    icon: List,
    prompt:
      "Write a numbered list of 5 surprising facts about {topic}. Each item must be 1-2 sentences and feel like an insider tip.",
    example: "5 things nobody tells you about launching a SaaS: 1. Your first 10 customers will all churn…",
  },
  {
    id: "storytelling",
    name: "Storytelling",
    description: "Narrative arc with tension and resolution that emotionally engages.",
    category: "Entertainment",
    icon: BookOpen,
    prompt:
      "Tell a 60-second story about {topic} for {audience}. Use a clear before / turning-point / after structure.",
    example: "Two years ago I was sleeping on a friend's couch. Yesterday I sold my company for $4M. Here's what changed…",
  },
  {
    id: "cta",
    name: "CTA-First",
    description: "Lead with the action you want the reader to take.",
    category: "Marketing",
    icon: MousePointerClick,
    prompt:
      "Write copy for {topic} that opens with a strong call to action and only then explains the value. Audience: {audience}.",
    example: "Bookmark this thread. In 60 seconds you'll know exactly how to price your next freelance project…",
  },
  {
    id: "question",
    name: "Question-Based",
    description: "Open with a question that demands the audience's own answer.",
    category: "Personal Brand",
    icon: HelpCircle,
    prompt:
      "Open with a thought-provoking question about {topic}, then deliver a 3-sentence answer for {audience}.",
    example: "What if the reason you're stuck isn't your strategy — it's your standards?",
  },
];
