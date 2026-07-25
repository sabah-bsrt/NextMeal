"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { resolveImageSrc } from "@/utils/resolveImageSrc";

type AuthenticatedImageProps = {
  imageUrl?: string | null;
  targetUrl?: string | null;
  alt: string;
  className?: string;
  imageKey?: string | number;
  onError?: () => void;
};

export function AuthenticatedImage({ imageUrl, targetUrl, alt, className, imageKey, onError }: AuthenticatedImageProps) {
  const resolvedSrc = useMemo(() => resolveImageSrc(targetUrl ?? imageUrl), [targetUrl, imageUrl]);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
      let cancelled = false;

    setFailed(false);
    setBlobUrl(null);

    const run = async () => {
      if (!resolvedSrc) return;

      // Token may be stored with quotes/whitespace depending on how it's set.
      // Keep the format consistent with `utils/api.ts` auth headers.
      const rawToken =
        typeof window !== "undefined" ? localStorage.getItem("nextmeal_auth_token") : null;
      const cleanedToken = rawToken
        ? rawToken.trim().replace(/^['"`]+|['"`]+$/g, "")
        : null;
      const authHeader = cleanedToken
        ? cleanedToken.startsWith("Bearer ") ? cleanedToken : `Bearer ${cleanedToken}`
        : null;
      const proxyUrl = `/api/image-proxy?target=${encodeURIComponent(resolvedSrc)}`;

      try {
        const resp = await fetch(proxyUrl, {
          headers: authHeader ? { Authorization: authHeader } : undefined,
          cache: "no-store",
        });

        if (!resp.ok) {
          // Try to read JSON body (may include upstream status/target)
          let details: Record<string, unknown> | null = null;
          try {
            details = (await resp.clone().json()) as Record<string, unknown>;
          } catch {
            // ignore
          }
          console.warn("Image proxy failed", { status: resp.status, proxyUrl, resolvedSrc, details });
          throw new Error(`Image proxy failed: ${resp.status}`);
        }

        const blob = await resp.blob();
        const objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setBlobUrl(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          onErrorRef.current?.();
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      setFailed(false);
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [resolvedSrc, imageKey]);

  if (!resolvedSrc || failed || !blobUrl) return null;

  return <img key={blobUrl} src={blobUrl} alt={alt} className={className} />;
}

