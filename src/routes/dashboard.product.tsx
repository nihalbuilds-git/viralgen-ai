import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package } from "lucide-react";
import { GeneratorPanel } from "@/components/generator-panel";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateProductDescription } from "@/lib/ai-mock";

export const Route = createFileRoute("/dashboard/product")({
  component: ProductTool,
});

function ProductTool() {
  const [name, setName] = useState("");
  const [features, setFeatures] = useState("");

  return (
    <GeneratorPanel
      title="Product Description Generator"
      description="Persuasive copy that turns browsers into buyers."
      icon={Package}
      onGenerate={() => generateProductDescription(name || "Your product", features || "key benefits and standout features")}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Product name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aero Hoodie" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="features">Key features / benefits</Label>
        <Textarea id="features" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="merino wool, lightweight, water-resistant, ethically made" rows={4} />
      </div>
    </GeneratorPanel>
  );
}
