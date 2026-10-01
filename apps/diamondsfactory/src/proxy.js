// Gives every visitor an x-session-id for the Commerce APIs (shared in @df/core).
export { proxy } from "@df/core/proxy";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
