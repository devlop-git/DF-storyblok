// Home page: the HomePage story for this site's market (shared route in @df/ui).
export { default, generateMetadata } from "@df/ui/routes/HomeRoute";

// Re-fetch published content from Storyblok at most once a minute.
export const revalidate = 60;
