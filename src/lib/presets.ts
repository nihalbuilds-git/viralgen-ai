// Sample presets shown on each generator as one-click starters.
// Removes the blank-page problem for first-time users.

export type CaptionPreset = {
  label: string;
  platform: string;
  product: string;
  tone: string;
  audience: string;
};

export type AdCopyPreset = {
  label: string;
  product: string;
  audience: string;
  offer: string;
  tone: string;
};

export type ProductPreset = {
  label: string;
  name: string;
  features: string;
  audience: string;
};

export type ImagePreset = {
  label: string;
  prompt: string;
  style: string;
  ratio: string;
};

export const CAPTION_PRESETS: CaptionPreset[] = [
  {
    label: "DTC product launch",
    platform: "Instagram",
    product: "A new AI-powered scheduling assistant for solopreneurs",
    tone: "engaging",
    audience: "Busy freelancers in their 30s",
  },
  {
    label: "Fitness motivation",
    platform: "TikTok",
    product: "5-minute morning mobility routine for desk workers",
    tone: "bold",
    audience: "Remote workers aged 25-40",
  },
  {
    label: "B2B SaaS thought leadership",
    platform: "LinkedIn",
    product: "Workflow automation tool for marketing teams",
    tone: "professional",
    audience: "Marketing managers at growing SaaS companies",
  },
];

export const ADCOPY_PRESETS: AdCopyPreset[] = [
  {
    label: "SaaS free trial",
    product: "AI scheduling assistant",
    audience: "Busy startup founders",
    offer: "14-day free trial, no credit card required",
    tone: "persuasive",
  },
  {
    label: "Ecommerce flash sale",
    product: "Premium merino wool hoodie",
    audience: "Outdoor enthusiasts aged 25-45",
    offer: "30% off this weekend only — free shipping over $50",
    tone: "urgent",
  },
  {
    label: "Course launch",
    product: "Cohort-based product design course",
    audience: "Mid-level designers wanting to go senior",
    offer: "Early-bird $200 off — closes Friday",
    tone: "bold",
  },
];

export const PRODUCT_PRESETS: ProductPreset[] = [
  {
    label: "Apparel — hoodie",
    name: "Aero Hoodie",
    features: "merino wool, lightweight, water-resistant, ethically made",
    audience: "Outdoor enthusiasts and digital nomads",
  },
  {
    label: "Beauty — serum",
    name: "Glow Renewal Serum",
    features: "vitamin C, hyaluronic acid, cruelty-free, suitable for sensitive skin",
    audience: "Skincare-savvy adults aged 25-45",
  },
  {
    label: "Tech — earbuds",
    name: "Pulse Pro Earbuds",
    features: "active noise cancellation, 36-hour battery, IPX5, multipoint Bluetooth",
    audience: "Commuters and remote workers",
  },
];

export const IMAGE_PRESETS: ImagePreset[] = [
  {
    label: "Product on pastel",
    prompt:
      "A matte black water bottle on a soft pastel gradient backdrop, studio lighting",
    style: "realistic",
    ratio: "1:1",
  },
  {
    label: "Cinematic portrait",
    prompt: "Studio portrait of a young entrepreneur, neon rim light, moody background",
    style: "realistic",
    ratio: "2:3",
  },
  {
    label: "Lifestyle hero",
    prompt: "Bright minimalist café morning scene with latte and notebook on marble table",
    style: "minimal",
    ratio: "3:2",
  },
];
