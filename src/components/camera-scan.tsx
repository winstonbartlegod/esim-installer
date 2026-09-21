import { Camera, CameraOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseLpa, type LpaProfile } from "@/lib/lpa";

export function CameraScan({ onProfile }: { onProfile: (profile: LpaProfile) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setRunning(true);
        const jsQR = (await import("jsqr")).default;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const tick = () => {
          if (stopped) return;
          if (video.readyState >= 2) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(image.data, image.width, image.height, {
              inversionAttempts: "attemptBoth",
            });
            if (result?.data) {
              const profile = parseLpa(result.data);
              if (profile) {
                onProfile(profile);
                return;
              }
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError("Camera is blocked. Use a screenshot or paste the code instead.");
      }
    }

    void start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onProfile]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] max-h-80 overflow-hidden rounded-lg border border-border bg-elevated">
        <video ref={videoRef} className="size-full object-cover" playsInline muted />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-3/5 w-3/5 rounded-md border-2 border-accent/80" />
        </div>
        {!running && !error ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <Camera className="size-6" />
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="flex items-start gap-2 text-sm text-muted">
          <CameraOff className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : (
        <p className="text-sm text-muted">
          Point the camera at the QR. I’ll grab it once I can see it.
        </p>
      )}
    </div>
  );
}
