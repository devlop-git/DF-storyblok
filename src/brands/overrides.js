// Per-brand Storyblok block overrides, merged over the shared registry in
// src/components/storyblok/index.js. Use this when one brand needs its own
// version of a block and colours/fonts/copy aren't enough.
//
// Put the components in src/components/brands/<brand>/, e.g.:
//
//   import AbHeroCarousel from "@/components/brands/austenblake/HeroCarousel";
//   import { withEditable } from "@/components/storyblok/withEditable";
//   const austenblake = { new_home_page: withEditable(AbHeroCarousel) };
//
// Everything not listed stays shared. Like src/brands/index.js, the choice is
// a build-time comparison, so the other brand's overrides aren't bundled.
const diamondsfactory = {};
const austenblake = {};

export const brandComponents =
  process.env.NEXT_PUBLIC_BRAND === "austenblake" ? austenblake : diamondsfactory;
