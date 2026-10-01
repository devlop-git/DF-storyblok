// Austen & Blake-only Storyblok blocks, merged over the shared registry in
// packages/ui/storyblok/index.js. Use this when AB needs its own version of a
// block (or a block only AB has, e.g. a store finder) and colours/copy aren't enough.
//
// Put the components in this app's src/components/, e.g.:
//
//   import AbHeroCarousel from "@/components/AbHeroCarousel";
//   import { withEditable } from "@df/ui/storyblok/withEditable";
//   export const brandComponents = { new_home_page: withEditable(AbHeroCarousel) };
//
// Everything not listed stays shared.
export const brandComponents = {};
