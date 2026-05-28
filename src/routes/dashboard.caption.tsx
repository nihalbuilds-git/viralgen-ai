import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { GeneratorPanel } from "@/components/generator-panel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateCaptions } from "@/lib/ai-mock";

export const Route = createFileRoute("/dashboard/caption")({
  component: CaptionTool,
});

function CaptionTool() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("engaging");

  return (
    <GeneratorPanel
      title="AI Caption Generator"
      description="Scroll-stopping captions for Instagram, TikTok, X, and LinkedIn."
      icon={MessageSquare}
      onGenerate={() => generateCaptions(topic || "a new product launch", tone)}
    >
      <div className="space-y-2">
        <Label htmlFor="topic">What's the post about?</Label>
        <Textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Behind-the-scenes of our spring photoshoot" rows={4} />
      </div>
      <div className="space-y-2">
        <Label>Tone of voice</Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="engaging">Engaging</SelectItem>
            <SelectItem value="witty">Witty</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
            <SelectItem value="inspirational">Inspirational</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </GeneratorPanel>
  );
}
