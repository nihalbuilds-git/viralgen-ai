// Placeholder AI generation utilities. Swap with OpenAI / Lovable AI calls.
// Each function returns a Promise<string[]> of generated variants.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateCaptions(prompt: string, tone = "engaging"): Promise<string[]> {
  await sleep(900);
  const hooks = ["✨", "🚀", "🔥", "💡", "🎯"];
  const closers = ["#trending", "#viral", "#mustread", "#contentcreator", "#growth"];
  return Array.from({ length: 4 }).map((_, i) =>
    `${pick(hooks)} ${tone[0].toUpperCase() + tone.slice(1)} take on "${prompt}" — variant ${i + 1}. ${pick(closers)} ${pick(closers)}`,
  );
}

export async function generateAdCopy(product: string, audience: string): Promise<string[]> {
  await sleep(900);
  return [
    `Stop scrolling. ${product} was built for ${audience} who refuse to settle. Try it free today.`,
    `${audience}, meet ${product}. The smarter way to win back your time. Limited launch pricing inside.`,
    `Tired of the old way? ${product} changes the game for ${audience}. Join 10,000+ early adopters.`,
  ];
}

export async function generateProductDescription(name: string, features: string): Promise<string[]> {
  await sleep(900);
  return [
    `Introducing ${name} — engineered for performance, designed for delight. Key features: ${features}. Experience the difference today.`,
    `${name} blends thoughtful design with powerful capability. ${features}. Built to last, made to love.`,
  ];
}

export async function generateImagePrompt(prompt: string): Promise<string> {
  await sleep(1200);
  // Returns a placeholder image URL — replace with real model output
  const seed = encodeURIComponent(prompt);
  return `https://picsum.photos/seed/${seed}/800/800`;
}
