import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  size?: "sm" | "icon" | "default";
  variant?: "ghost" | "outline" | "default";
  label?: string;
  className?: string;
}

export function CopyButton({ text, size = "icon", variant = "ghost", label, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const inner = (
    <Button variant={variant} size={size} onClick={handle} className={cn(className)}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5"
          >
            <Check className="h-4 w-4 text-emerald-500" />
            {label && <span>Copied</span>}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5"
          >
            <Copy className="h-4 w-4" />
            {label && <span>{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );

  if (label) return inner;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
    </Tooltip>
  );
}
