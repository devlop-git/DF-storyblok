import { getPDP } from "@/services/commerce";

// Server-side proxy so the browser can fetch a new PDP configuration when the
// shopper changes an option (no full page navigation), without hitting CORS
// on the real backend.
export async function GET(request, { params }) {
  const { slug, sku } = await params;
  const language = new URL(request.url).searchParams.get("language") || "de";
  const result = await getPDP(slug, sku, language);
  if (!result) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(result);
}
