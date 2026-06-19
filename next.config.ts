import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
};

export default nextConfig;
