import { brand } from "./index.js";

// Per-brand Storyblok block overrides, merged over the shared registry in
// src/components/storyblok/index.js. Use this when one brand needs its own
// version of a block and colours/fonts/copy aren't enough, e.g.:
//
//   import AbHeroCarousel from "@/components/brands/austenblake/HeroCarousel";
//   import { withEditable } from "@/components/storyblok/withEditable";
//   austenblake: { new_home_page: withEditable(AbHeroCarousel) },
//
// Everything not listed here stays shared.
const OVERRIDES = {
  diamondsfactory: {},
  austenblake: {},
};

export const brandComponents = OVERRIDES[brand.id] ?? {};
