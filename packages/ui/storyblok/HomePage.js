import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";

// Content type "home_page": renders the Sections field (the Strapi dynamic zone)
// in the order editors set in Storyblok.
export default function HomePage({ blok }) {
  return (
    <main {...storyblokEditable(blok)} className="flex flex-col gap-y-12">
      {blok.Sections?.map((section) => (
        <StoryblokServerComponent blok={section} key={section._uid} />
      ))}
    </main>
  );
}
