import { StoryblokStory } from "@df/ui/storyblok";
import { notFound } from "next/navigation";

import { fetchStory, STORY_RELATIONS } from "@df/core/lib/storyblok";

// Any page created in Storyblok is served at its slug:
// "about" -> /about, "customer-care/valuations" -> /customer-care/valuations
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const story = await fetchStory(slug.join("/"));
  return {
    title: story?.content?.seo_title || story?.content?.title || story?.name,
    description: story?.content?.seo_description || undefined,
  };
}

export default async function StoryPage({ params }) {
  const { slug } = await params;
  const story = await fetchStory(slug.join("/"), { resolve_relations: STORY_RELATIONS });
  if (!story) notFound();

  return <StoryblokStory story={story} bridgeOptions={{ resolveRelations: STORY_RELATIONS }} />;
}
