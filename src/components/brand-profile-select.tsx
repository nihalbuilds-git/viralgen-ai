import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Sparkles, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { listBrandProfiles } from "@/lib/brand-profiles.functions";

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function BrandProfileSelect({ value, onChange }: Props) {
  const fn = useServerFn(listBrandProfiles);
  const { data } = useQuery({ queryKey: ["brand-profiles"], queryFn: () => fn() });
  const profiles = data ?? [];
  const selected = value ?? "__default__";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Brand profile
        </Label>
        <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
          <Link to="/dashboard/brand-profiles">
            <Plus className="h-3 w-3" /> Manage
          </Link>
        </Button>
      </div>
      <Select
        value={selected}
        onValueChange={(v) => onChange(v === "__default__" ? null : v)}
      >
        <SelectTrigger aria-label="Brand profile">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__default__">Default (Settings brand voice)</SelectItem>
          {profiles.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
              {p.is_default ? " · default" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
