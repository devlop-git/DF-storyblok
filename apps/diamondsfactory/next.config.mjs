import { brand } from "./brand/config.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Shared packages (@df/ui, @df/core) import "@brand/config" and
    // "@brand/overrides"; in this app they mean this app's brand/ folder.
    resolveAlias: {
      "@brand/config": "./brand/config.js",
      "@brand/overrides": "./brand/overrides.js",
    },
  },

  images: {
    remotePatterns: [
      // Storyblok asset CDN (a.storyblok.com, a-us.storyblok.com, …)
      { protocol: "https", hostname: "**.storyblok.com" },
      // Commerce product images (PLP/PDP) for this brand (brand/config.js -> imageHosts)
      ...brand.imageHosts.map((hostname) => ({ protocol: "https", hostname })),
    ],
  },
};

export default nextConfig;
