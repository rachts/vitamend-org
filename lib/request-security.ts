const authJsPaths = /^\/api\/auth\/(?:csrf|providers|session|signin|signout|callback|error|verify-request)(?:\/|$)/;

export function isAllowedMutation(req: Pick<Request, "url" | "method" | "headers">): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase())) return true;
  const url = new URL(req.url);
  // Auth.js owns its CSRF checks; this webhook owns its signature validation.
  if (authJsPaths.test(url.pathname) || url.pathname === "/api/webhooks/twilio") return true;
  const origin = req.headers.get("origin");
  if (origin) return origin === url.origin;
  if (req.headers.get("sec-fetch-site") === "cross-site") return false;
  // Cookie-authenticated writes must supply a same-origin Origin or Referer.
  const referer = req.headers.get("referer");
  if (referer) {
    try { return new URL(referer).origin === url.origin; } catch { return false; }
  }
  return !req.headers.get("cookie");
}
