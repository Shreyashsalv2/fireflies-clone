import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: a harmless "inferred workspace root" warning may appear locally due to
  // a stray lockfile in the home directory. It does not affect the build; Vercel
  // uses the configured project root. See README for details.
};

export default nextConfig;
