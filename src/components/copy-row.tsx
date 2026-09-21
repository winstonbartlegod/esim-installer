import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied ${label.toLowerCase()}`);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Couldn’t copy — select the text instead.");
    }
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-elevated px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p
          className={cn(
            "mt-0.5 break-all text-sm text-fg",
            mono && "font-mono text-xs leading-snug",
          )}
        >
          {value}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 text-muted"
        onClick={copy}
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}
