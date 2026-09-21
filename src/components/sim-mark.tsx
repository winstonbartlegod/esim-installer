import { cn } from "@/lib/utils";

export function SimMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={cn("text-accent", className)}
      aria-hidden="true"
    >
      <rect x="8" y="6" width="24" height="28" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M24 6v5.5a1.5 1.5 0 0 0 1.5 1.5H32" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="16" width="5" height="4" rx="0.6" fill="currentColor" />
      <rect x="19.5" y="16" width="7.5" height="4" rx="0.6" fill="currentColor" opacity="0.55" />
      <rect x="13" y="22" width="7.5" height="4" rx="0.6" fill="currentColor" opacity="0.55" />
      <rect x="22" y="22" width="5" height="4" rx="0.6" fill="currentColor" />
    </svg>
  );
}
