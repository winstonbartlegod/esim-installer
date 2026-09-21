import { FileImage, Keyboard, ScanLine, Type } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { CameraScan } from "@/components/camera-scan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_LPA, parseLpa, type LpaProfile } from "@/lib/lpa";
import { decodeQrFromBlob } from "@/lib/qr";
import { cn } from "@/lib/utils";

type Mode = "upload" | "paste" | "manual" | "scan";

export function Composer({ onProfile }: { onProfile: (profile: LpaProfile) => void }) {
  const [mode, setMode] = useState<Mode>("upload");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [smdp, setSmdp] = useState("");
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        const profile = await decodeQrFromBlob(file);
        onProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not read that QR.");
      } finally {
        setBusy(false);
      }
    },
    [onProfile],
  );

  function submitPaste(event: React.FormEvent) {
    event.preventDefault();
    const profile = parseLpa(pasteValue);
    if (!profile) {
      setError("That doesn’t look like an eSIM code. Paste the LPA string or the install URL.");
      return;
    }
    setError(null);
    onProfile(profile);
  }

  function submitManual(event: React.FormEvent) {
    event.preventDefault();
    const profile = parseLpa(`LPA:1$${smdp.trim()}$${code.trim()}`);
    if (!profile) {
      setError("Need the SM-DP+ host (like smdp.carrier.com) and the activation code.");
      return;
    }
    setError(null);
    onProfile(profile);
  }

  function loadDemo() {
    const profile = parseLpa(DEMO_LPA);
    if (profile) onProfile(profile);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1 rounded-lg bg-elevated p-1">
        {(
          [
            ["upload", FileImage, "Upload QR"],
            ["paste", Type, "Paste code"],
            ["manual", Keyboard, "Type fields"],
            ["scan", ScanLine, "Camera"],
          ] as const
        ).map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setError(null);
            }}
            className={cn(
              "flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium sm:text-sm",
              "transition-[background-color,color] duration-[var(--motion-quick)]",
              mode === id ? "bg-surface text-fg" : "text-muted hover:text-fg",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void handleFile(e.dataTransfer.files[0]);
          }}
          onPaste={(e) => {
            const item = [...e.clipboardData.items].find((i) => i.type.startsWith("image/"));
            if (item) {
              e.preventDefault();
              void handleFile(item.getAsFile());
            }
          }}
          className={cn(
            "flex min-h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-5 py-10 text-center",
            "transition-[border-color,background-color] duration-[var(--motion-fast)]",
            drag ? "border-accent bg-accent/10" : "border-border-strong bg-elevated/60 hover:border-accent/50",
          )}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            suppressHydrationWarning
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-surface">
            <FileImage className="size-5 text-accent" />
          </div>
          <div className="max-w-sm">
            <p className="text-base font-medium text-fg">
              {busy ? "Reading the QR…" : "Put the QR here"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Screenshot from the email is fine. PNG, JPG, or paste an image.
            </p>
          </div>
        </div>
      ) : null}

      {mode === "paste" ? (
        <form onSubmit={submitPaste} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-fg" htmlFor="lpa">
            LPA code or the Apple/Android install URL
          </label>
          <textarea
            id="lpa"
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder="LPA:1$smdp.carrier.com$ACTIVATION-CODE"
            rows={4}
            className="w-full resize-y rounded-lg border border-border bg-elevated px-3 py-2.5 font-mono text-sm text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
          <Button type="submit" size="lg">
            Make the install link
          </Button>
        </form>
      ) : null}

      {mode === "manual" ? (
        <form onSubmit={submitManual} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-fg" htmlFor="smdp">
            SM-DP+ address
          </label>
          <Input
            id="smdp"
            value={smdp}
            onChange={(e) => setSmdp(e.target.value)}
            placeholder="rsp.truphone.com"
            autoComplete="off"
            spellCheck={false}
          />
          <label className="text-sm font-medium text-fg" htmlFor="matching">
            Activation / matching ID
          </label>
          <Input
            id="matching"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="JQ-209U6H-6I82J5"
            autoComplete="off"
            spellCheck={false}
          />
          <Button type="submit" size="lg">
            Make the install link
          </Button>
        </form>
      ) : null}

      {mode === "scan" ? <CameraScan onProfile={onProfile} /> : null}

      {error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" variant="secondary" onClick={loadDemo}>
        Try it with a sample
      </Button>
    </div>
  );
}
