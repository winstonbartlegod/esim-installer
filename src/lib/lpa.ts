export type LpaProfile = {
  version: string;
  smdp: string;
  matchingId: string;
  oid?: string;
  confirmationRequired: boolean;
  raw: string;
};

const LPA_RE =
  /^(?:LPA:)?1\$([A-Za-z0-9.-]+)\$([A-Za-z0-9._~+/-]+)(?:\$([^$]*))?(?:\$([01]))?$/i;

export function canonicalizeLpa(raw: string): string {
  const parsed = parseLpa(raw);
  if (!parsed) {
    throw new Error("Could not read an eSIM activation code from that input.");
  }
  return parsed.raw;
}

export function parseLpa(input: string): LpaProfile | null {
  if (!input) return null;
  let text = input.trim().replace(/^\uFEFF/, "");

  const fromUrl = extractCarddata(text);
  if (fromUrl) text = fromUrl;

  text = text.replace(/\s+/g, "");

  if (/^lpa:\d\$/i.test(text) === false) {
    if (/^1\$/.test(text)) text = `LPA:${text}`;
    else if (/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}\$[A-Za-z0-9._~+/-]+$/.test(text)) {
      text = `LPA:1$${text}`;
    }
  } else {
    text = text.replace(/^lpa:/i, "LPA:");
  }

  const match = text.match(LPA_RE);
  if (!match) return null;

  const smdp = match[1];
  const matchingId = match[2];
  if (!smdp.includes(".") || matchingId.length < 2) return null;

  const oid = match[3] && match[3].length > 0 ? match[3] : undefined;
  const confirmationRequired = match[4] === "1";

  let raw = `LPA:1$${smdp}$${matchingId}`;
  if (oid) raw += `$${oid}`;
  if (confirmationRequired) raw += oid ? `$1` : `$$1`;

  return {
    version: "1",
    smdp,
    matchingId,
    oid,
    confirmationRequired,
    raw,
  };
}

function extractCarddata(text: string): string | null {
  try {
    if (/^https?:\/\//i.test(text)) {
      const url = new URL(text);
      const card = url.searchParams.get("carddata");
      if (card) return card;
    }
  } catch {
    /* not a URL */
  }
  const idx = text.toLowerCase().indexOf("carddata=");
  if (idx >= 0) {
    return decodeURIComponent(text.slice(idx + "carddata=".length).split("&")[0]);
  }
  return null;
}

export function appleInstallUrl(lpa: string): string {
  return `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpa)}`;
}

export function androidInstallUrl(lpa: string): string {
  return `https://esimsetup.android.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpa)}`;
}

export function encodeShareCode(lpa: string): string {
  const bytes = new TextEncoder().encode(lpa);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShareCode(code: string): string | null {
  try {
    const padded = code.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const bin = atob(padded + pad);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const lpa = new TextDecoder().decode(bytes);
    return parseLpa(lpa)?.raw ?? null;
  } catch {
    return parseLpa(code)?.raw ?? null;
  }
}

export function sharePath(lpa: string): string {
  return `/i/${encodeShareCode(lpa)}`;
}

export const DEMO_LPA = "LPA:1$rsp.truphone.com$QRF-SPEEDTEST";
