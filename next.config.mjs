/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Storyblok asset CDN (a.storyblok.com, a-us.storyblok.com, …)
    remotePatterns: [
      { protocol: "https", hostname: "**.storyblok.com" },
      // Commerce product images (PLP/PDP)
      { protocol: "https", hostname: "static.diamondsfactory.com" },
    ],
  },
};

export default nextConfig;
