import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone } from "lucide-react";
import { GeneratorPanel } from "@/components/generator-panel";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { generateAdCopy } from "@/lib/ai-mock";

export const Route = createFileRoute("/dashboard/adcopy")({
  component: AdCopyTool,
});

function AdCopyTool() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");

  return (
    <GeneratorPanel
      title="AI Ad Copy Generator"
      description="High-converting headlines and body copy for Meta, Google, and TikTok ads."
      icon={Megaphone}
      onGenerate={() => generateAdCopy(product || "your product", audience || "modern marketers")}
    >
      <div className="space-y-2">
        <Label htmlFor="product">Product / Service</Label>
        <Input id="product" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. AI scheduling assistant" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audience">Target audience</Label>
        <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Busy startup founders" />
      </div>
    </GeneratorPanel>
  );
}
