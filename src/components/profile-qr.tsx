import { useEffect, useState } from "react";
import { lpaToQrDataUrl } from "@/lib/qr";

export function ProfileQr({ lpa, caption }: { lpa: string; caption?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    lpaToQrDataUrl(lpa)
      .then((url) => {
        if (alive) setSrc(url);
      })
      .catch(() => {
        if (alive) setSrc(null);
      });
    return () => {
      alive = false;
    };
  }, [lpa]);

  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="rounded-lg bg-qr p-3">
        {src ? (
          <img src={src} alt="eSIM QR code" width={208} height={208} className="size-52" />
        ) : (
          <div className="size-52 animate-pulse rounded-sm bg-border" />
        )}
      </div>
      {caption ? (
        <figcaption className="max-w-64 text-center text-xs leading-snug text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
