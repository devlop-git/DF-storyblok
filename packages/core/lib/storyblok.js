import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";

// Storyblok client (each app's .env.local has its own space token).
// Blocks -> React components are registered by @df/ui/storyblok, which every
// route that renders Storyblok content imports.
export const getStoryblokApi = storyblokInit({
  accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,

  use: [apiPlugin],

  apiOptions: {
    // Same variable the migrate/backup scripts use: eu | us | ap | ca | cn
    region: process.env.STORYBLOK_REGION || "eu",
  },
});

// Draft content locally / in preview, published content in production.
// Override with STORYBLOK_VERSION=draft|published if needed.
const version =
  process.env.STORYBLOK_VERSION ??
  (process.env.NODE_ENV === "production" ? "published" : "draft");

// Reference fields resolved to full stories when a page is rendered (the
// static page breadcrumb shows its parent page's title).
export const STORY_RELATIONS = "static_page.parent_page";

/**
 * Fetch a single story by its full slug (e.g. "home", "about", "blog/my-post").
 * Returns null when the story does not exist so pages can call notFound().
 */
export async function fetchStory(slug, params = {}) {
  try {
    const { data } = await getStoryblokApi().get(`cdn/stories/${slug}`, {
      version,
      ...params,
    });
    return data.story;
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
}

/**
 * First story of a content type, e.g. the "plp_page" story that lays out every
 * PLP (the Strapi frontend used the first PLP Page entry the same way).
 */
export async function fetchFirstStory(contentType) {
  const stories = await fetchStories({ content_type: contentType, per_page: 1 });
  return stories[0] ?? null;
}

/**
 * List stories, e.g. fetchStories({ content_type: "footer_column" }).
 * Supports every Content Delivery API param (filter_query, resolve_relations,
 * sort_by, …). Returns up to 100 stories.
 */
export async function fetchStories(params = {}) {
  const { data } = await getStoryblokApi().get("cdn/stories", {
    version,
    per_page: 100,
    ...params,
  });
  return data.stories ?? [];
}
