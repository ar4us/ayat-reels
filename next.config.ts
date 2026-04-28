import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'fluent-ffmpeg',
    'ffmpeg-static',
    'ffprobe-static',
    'canvas',
    'sharp',
  ],
  turbopack: {},
};

export default nextConfig;
