import { Apple, Share2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopyRow } from "@/components/copy-row";
import { ProfileQr } from "@/components/profile-qr";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/brand";
import { androidInstallUrl, appleInstallUrl, sharePath, type LpaProfile } from "@/lib/lpa";
import { isInIframe } from "@/lib/device";
import { cn } from "@/lib/utils";

export function InstallCard({ profile }: { profile: LpaProfile }) {
  const apple = appleInstallUrl(profile.raw);
  const android = androidInstallUrl(profile.raw);
  const path = sharePath(profile.raw);
  const [shareUrl, setShareUrl] = useState(path);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}${path}`);
    setPreview(isInIframe());
  }, [path]);

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Copied the link");
    } catch {
      toast.error("Couldn’t copy — select the text instead.");
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: APP_NAME,
          text: "Open this on the phone that needs the eSIM, then tap Install.",
          url: shareUrl,
        });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copyShare();
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">Got it</p>
        <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
          Open this on the phone that needs the eSIM
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Tap the iPhone or Android button. Your phone opens its own installer with the plan filled
          in. If that doesn’t work, scan the QR or copy the two codes below.
        </p>
      </header>

      {preview ? (
        <p className="rounded-md border border-border bg-elevated px-3 py-2 text-xs leading-relaxed text-muted">
          This page is inside another site, so the install buttons may not work. Open the
          link directly on your phone.
        </p>
      ) : null}

      <div className="grid gap-2">
        <InstallLink href={apple} label="Install on iPhone" hint="iOS 17.4 or later" />
        <InstallLink
          href={android}
          label="Install on Android"
          hint="Android 10+ with Google services"
          variant="secondary"
        />
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={nativeShare}>
            <Share2 className="size-4" />
            Share link
          </Button>
          <Button type="button" variant="ghost" onClick={copyShare}>
            Copy link
          </Button>
        </div>
      </div>

      <CopyRow label="Link to send" value={shareUrl} mono={false} />

      <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <ProfileQr
          lpa={profile.raw}
          caption="If the buttons fail, scan this in Settings → Add eSIM."
        />
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            If one-tap doesn’t work
          </p>
          <CopyRow label="SM-DP+ address" value={profile.smdp} />
          <CopyRow label="Activation code" value={profile.matchingId} />
          <CopyRow label="Full LPA string" value={profile.raw} />
          {profile.confirmationRequired ? (
            <p className="text-xs text-muted">
              This one also asks for a confirmation code from the carrier after install starts.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InstallLink({
  href,
  label,
  hint,
  variant = "primary",
}: {
  href: string;
  label: string;
  hint: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      className={cn(
        "group flex h-12 items-center justify-between gap-3 rounded-lg px-4 text-sm font-medium",
        "transition-[transform,background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
        "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        variant === "primary"
          ? "bg-accent text-accent-fg hover:bg-accent-hover"
          : "border border-border-strong bg-elevated text-fg hover:bg-surface-2",
      )}
    >
      <span className="flex items-center gap-2">
        {label.includes("iPhone") ? <Apple className="size-4" /> : <Smartphone className="size-4" />}
        {label}
      </span>
      <span
        className={cn(
          "hidden text-xs font-normal sm:inline",
          variant === "primary" ? "text-accent-fg/70" : "text-muted",
        )}
      >
        {hint}
      </span>
    </a>
  );
}
