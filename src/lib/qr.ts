import { parseLpa, type LpaProfile } from "./lpa";

async function loadJsQR() {
  const mod = await import("jsqr");
  return mod.default;
}

function drawScaled(
  bitmap: ImageBitmap,
  targetMax: number,
): { data: Uint8ClampedArray; width: number; height: number } {
  const scale = Math.min(targetMax / Math.max(bitmap.width, bitmap.height), 4);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not read that image.");
  ctx.imageSmoothingEnabled = scale < 1;
  ctx.drawImage(bitmap, 0, 0, width, height);
  const image = ctx.getImageData(0, 0, width, height);
  return { data: image.data, width, height };
}

export async function decodeQrFromBlob(blob: Blob): Promise<LpaProfile> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new Error("That file is not a readable image. Use PNG, JPG, or WebP.");
  }

  const jsQR = await loadJsQR();
  const sizes = [Math.max(bitmap.width, bitmap.height), 900, 1400, 400];
  const tried = new Set<number>();

  for (const size of sizes) {
    const max = Math.round(size);
    if (tried.has(max)) continue;
    tried.add(max);
    const { data, width, height } = drawScaled(bitmap, max);
    const result = jsQR(data, width, height, { inversionAttempts: "attemptBoth" });
    if (result?.data) {
      const profile = parseLpa(result.data);
      if (profile) return profile;
      throw new Error(
        `Found a QR, but it is not an eSIM code. It decoded as: ${result.data.slice(0, 80)}`,
      );
    }
  }

  throw new Error(
    "No QR code found in that image. Try a brighter, tighter crop of the code.",
  );
}

export async function lpaToQrDataUrl(lpa: string): Promise<string> {
  const QR = await import("qrcode");
  return QR.toDataURL(lpa, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#0b0c0f", light: "#f4f5f7" },
  });
}
