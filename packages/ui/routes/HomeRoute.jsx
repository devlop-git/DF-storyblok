import { StoryblokStory } from "@df/ui/storyblok";
import { notFound } from "next/navigation";

import { fetchStoryForMarket } from "@df/core/lib/market";

// The HomePage story whose `market` is the current market (like the Strapi
// frontend's getHomepage(locale, market)); without a match, the "home" story.
function getHomeStory() {
  return fetchStoryForMarket("home_page", "market", (stories) =>
    stories.find((story) => story.slug === "home") ?? stories[0],
  );
}

export async function generateMetadata() {
  const story = await getHomeStory();
  return { title: story?.content?.seo_title || story?.content?.Title || story?.name };
}

export default async function Home() {
  const story = await getHomeStory();
  if (!story) notFound();

  return <StoryblokStory story={story} />;
}
