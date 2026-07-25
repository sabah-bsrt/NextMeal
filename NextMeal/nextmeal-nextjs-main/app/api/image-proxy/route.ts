import { NextResponse } from "next/server";

function getApiBaseRoot(): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").trim();
  // Remove trailing "/api" (or "/api/") so we can validate file URLs.
  return base.replace(/\/api\/?$/, "");
}

function isAllowedTarget(target: string): boolean {
  const allowedRoot = getApiBaseRoot();
  return target.startsWith(allowedRoot);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("target");

  if (!target) {
    return NextResponse.json({ error: "Missing target" }, { status: 400 });
  }

  let decodedTarget = target;
  try {
    decodedTarget = decodeURIComponent(target);
  } catch {
    // Keep original
  }

  if (!isAllowedTarget(decodedTarget)) {
    return NextResponse.json({ error: "Target not allowed" }, { status: 403 });
  }

  const upstreamHeaders: Record<string, string> = {};

  // Forward auth/cookies/referer so the backend media endpoint can authorize.
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (auth) {
    // Forward the auth header exactly once. Some backends may be picky.
    upstreamHeaders.Authorization = auth;
    upstreamHeaders.authorization = auth; // Some frameworks read lowercase specifically
  }

  const cookie = req.headers.get("cookie");
  if (cookie) upstreamHeaders.cookie = cookie;

  // If the backend protects media endpoints via a cookie, synthesize one from
  // the bearer token. This keeps the proxy working even when the browser
  // isn't sending cookies (e.g. localStorage-based auth).
  if (!upstreamHeaders.cookie && auth) {
    // Typical header: "Bearer <token>"
    const match = auth.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim().replace(/^['"`]+|['"`]+$/g, "");
    if (token) {
      upstreamHeaders.cookie = `nextmeal_auth_token=${token}`;
      // Also set canonical header name variant (some backends/frameworks are odd)
      upstreamHeaders.Cookie = `nextmeal_auth_token=${token}`;
      // Some systems expect the cookie value to be the full "Bearer ..." string.
      // (We omit that variant by default because it contains spaces.)
    }
  }

  // Some backends may enforce referer checks on media endpoints.
  const referer = req.headers.get("referer");
  upstreamHeaders.referer = referer ?? "http://localhost:3000";

  const origin = req.headers.get("origin");
  upstreamHeaders.origin = origin ?? "http://localhost:3000";

  const userAgent = req.headers.get("user-agent");
  if (userAgent) upstreamHeaders["user-agent"] = userAgent;

  const accept = req.headers.get("accept");
  if (accept) upstreamHeaders.accept = accept;

  const acceptLanguage = req.headers.get("accept-language");
  if (acceptLanguage) upstreamHeaders["accept-language"] = acceptLanguage;

  const secFetchSite = req.headers.get("sec-fetch-site");
  if (secFetchSite) upstreamHeaders["sec-fetch-site"] = secFetchSite;

  const upstream = await fetch(decodedTarget, {
    method: "GET",
    headers: upstreamHeaders,
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");

    // Fallback: backend sometimes protects static `/storage/...` media, but provides
    // an authenticated media endpoint at `/recipes/:id/image`.
    // If the target looks like `/storage/recipes/<uuid>.<ext>`, try swapping to `/recipes/<uuid>/image`.
    let attemptedFallback: string | null = null;
    try {
      const u = new URL(decodedTarget);
      const match = u.pathname.match(/^\/storage\/recipes\/([^/]+)\.(png|jpe?g|webp|gif)$/i);
      if (match) {
        const uuid = match[1];
        attemptedFallback = `${getApiBaseRoot()}/recipes/${uuid}/image`;
        const fallbackResp = await fetch(attemptedFallback, {
          method: "GET",
          headers: upstreamHeaders,
        });

        if (fallbackResp.ok) {
          const contentType = fallbackResp.headers.get("content-type") ?? "application/octet-stream";
          return new NextResponse(fallbackResp.body, {
            status: 200,
            headers: {
              "content-type": contentType,
              "cache-control": "no-store",
            },
          });
        }
      }
    } catch {
      // ignore fallback errors
    }

    return NextResponse.json(
      {
        error: "Upstream image fetch failed",
        status: upstream.status,
        target: decodedTarget,
        body: errText ? errText.slice(0, 500) : undefined,
        debug: {
          incomingAuthorizationPresent: !!auth,
          forwardedAuthorizationPreview: (upstreamHeaders.Authorization ?? "").slice(0, 30) || undefined,
          forwardedCookiePresent: !!(upstreamHeaders.cookie ?? upstreamHeaders.Cookie),
          forwardedCookiePreview: (upstreamHeaders.cookie ?? upstreamHeaders.Cookie ?? "").slice(0, 60) || undefined,
          forwardedReferer: referer ?? undefined,
          forwardedOrigin: upstreamHeaders.origin ?? undefined,
          resolvedAllowedRoot: getApiBaseRoot(),
          attemptedFallback,
        },
      },
      { status: upstream.status }
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const cacheControl = "no-store";

  // Stream the binary data back to the browser.
  const res = new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": cacheControl,
    },
  });

  return res;
}

