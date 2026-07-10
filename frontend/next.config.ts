import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tuck the dev-only Next.js indicator into the bottom-right so it doesn't clash
  // with the top-bar avatar. This overlay never appears in production builds.
  devIndicators: {
    position: "bottom-right",
  },
  // Note: a harmless "inferred workspace root" warning may appear locally due to
  // a stray lockfile in the home directory. It does not affect the build; Vercel
  // uses the configured project root. See README for details.
};

export default nextConfig;
