import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker production image — generates a self-contained
  // server in .next/standalone that does NOT need node_modules at runtime.
  output: "standalone",
};

export default nextConfig;
