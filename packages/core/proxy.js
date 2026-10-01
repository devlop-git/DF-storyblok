import { NextResponse } from "next/server";

const SESSION_ID_COOKIE = "x-session-id";

// Shared session-id proxy (Next.js 16 renamed middleware.js to proxy.js).
// Ensures every request carries one session id: read it from the incoming
// cookie if the browser already has one, otherwise mint a uuid, forward it
// on the request headers (so this request's Server Components can read it
// via next/headers before the Set-Cookie round-trip completes), and set it
// as a session cookie (no maxAge -- cleared when the browser closes).
export function proxy(request) {
  const existing = request.cookies.get(SESSION_ID_COOKIE)?.value;
  const sessionId = existing ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SESSION_ID_COOKIE, sessionId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!existing) {
    response.cookies.set(SESSION_ID_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

// Each app's src/proxy.js re-exports `proxy` and declares its own `config`
// (Next.js only reads the matcher when it's written literally in that file).
