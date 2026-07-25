export function resolveImageSrc(imageUrl?: string | null): string | null {
  const cleaned = (imageUrl ?? "").trim().replace(/^['"`]+|['"`]+$/g, "");
  if (!cleaned) return null;

  // Backend sometimes returns stringified null/undefined
  if (cleaned === "null" || cleaned === "undefined") return null;

  // If it's already a fully-qualified URL, trust it.
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
  if (cleaned.startsWith("//")) return `http:${cleaned}`;

  // If it's scheme-less host URL (e.g. "localhost:8000/uploads/x.jpg"), prefix with API protocol.
  if (/^[a-zA-Z0-9.-]+:\d+/.test(cleaned)) {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "").trim() || "http://localhost:8000";
    const baseRoot = base.replace(/\/api\/?$/, "");
    const protocolMatch = baseRoot.match(/^(https?:)\/\//);
    const protocol = protocolMatch ? protocolMatch[1] : "http";
    // Ensure we keep the host/path as-is.
    return cleaned.startsWith("http") ? cleaned : `${protocol}//${cleaned}`;
  }

  const base =
    (process.env.NEXT_PUBLIC_API_URL ?? "").trim() || "http://localhost:8000";
  const baseRoot = base.replace(/\/api\/?$/, "");

  const relative = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return baseRoot.endsWith("/") ? `${baseRoot.slice(0, -1)}${relative}` : `${baseRoot}${relative}`;
}

