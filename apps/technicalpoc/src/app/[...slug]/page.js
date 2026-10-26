// Any Storyblok story at its URL, e.g. /engagement-rings (shared route in @df/ui).
export { default, generateMetadata } from "@df/ui/routes/StoryRoute";

// The Algolia PLP is server-rendered per request (react-instantsearch-nextjs).
export const dynamic = "force-dynamic";
