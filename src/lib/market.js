import { MARKET } from "@/constants/languages";
import { fetchStories } from "@/lib/storyblok";

// The site's market (e.g. "germany"), same env var as the Strapi frontend.
export function getCurrentMarket() {
  return MARKET;
}

// The Storyblok "market" story whose `slug` field matches the current market
// (case-insensitive), or null if none exists yet. Other content (footer,
// static pages) references a market by this story's uuid.
export async function getCurrentMarketStory() {
  return findMarketStory();
}

/**
 * The story of a content type for the current market, like the Strapi
 * frontend's `filters[market][slug][$eq]=...` queries: the first story whose
 * `field` (a single market or a list of markets) includes the current market.
 * Falls back to `fallback(stories)` (default: the first story) when none matches.
 *
 *   await fetchStoryForMarket("home_page", "market", (s) => s.find((x) => x.slug === "home"))
 */
export async function fetchStoryForMarket(contentType, field = "market", fallback) {
  const [marketStory, stories] = await Promise.all([
    findMarketStory(),
    fetchStories({ content_type: contentType }),
  ]);

  const forMarket =
    marketStory &&
    stories.find((story) => {
      const value = story.content?.[field];
      return Array.isArray(value) ? value.includes(marketStory.uuid) : value === marketStory.uuid;
    });

  return forMarket ?? (fallback ? fallback(stories) : stories[0]) ?? null;
}

async function findMarketStory() {
  const market = getCurrentMarket().toLowerCase();
  const markets = await fetchStories({ content_type: "market" });
  return (
    markets.find((m) => (m.content?.slug || m.slug || "").toLowerCase() === market) ??
    null
  );
}
