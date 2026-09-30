import { brand } from "./src/brands/index.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Always define the brand at build time (default "diamondsfactory" when the
  // env file doesn't set it), so src/brands can drop the other brand's code.
  env: { NEXT_PUBLIC_BRAND: brand.id },

  // Each brand builds into its own folder, so both can run/build side by side
  // (Diamonds Factory keeps the default ".next").
  distDir: brand.id === "diamondsfactory" ? ".next" : `.next-${brand.id}`,

  images: {
    remotePatterns: [
      // Storyblok asset CDN (a.storyblok.com, a-us.storyblok.com, …)
      { protocol: "https", hostname: "**.storyblok.com" },
      // Commerce product images (PLP/PDP), per brand (src/brands/*.js -> imageHosts)
      ...brand.imageHosts.map((hostname) => ({ protocol: "https", hostname })),
    ],
  },
};

export default nextConfig;
