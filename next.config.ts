import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  cacheHandler: path.resolve("./cache-handler.js"),
  cacheMaxMemorySize: 0,
};

export default nextConfig;
