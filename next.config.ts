import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix turbopack root detection issue with parent lockfiles
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
