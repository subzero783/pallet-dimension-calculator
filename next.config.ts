import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["argon2", "mongoose"],
  reactStrictMode: true,
};

export default nextConfig;
