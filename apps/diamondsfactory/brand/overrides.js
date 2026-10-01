// Diamonds Factory-only Storyblok blocks, merged over the shared registry in
// packages/ui/storyblok/index.js. Use this when DF needs its own version of a
// block (or a block only DF has) and colours/copy aren't enough.
//
// Put the components in this app's src/components/, e.g.:
//
//   import DfHeroCarousel from "@/components/DfHeroCarousel";
//   import { withEditable } from "@df/ui/storyblok/withEditable";
//   export const brandComponents = { new_home_page: withEditable(DfHeroCarousel) };
//
// Everything not listed stays shared.
export const brandComponents = {};
