import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["next-auth", "@auth/core"],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
