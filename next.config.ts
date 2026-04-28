import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push({
      'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
      'ffmpeg-static': 'commonjs ffmpeg-static',
      'ffprobe-static': 'commonjs ffprobe-static',
      'canvas': 'commonjs canvas',
      'sharp': 'commonjs sharp',
    });
    return config;
  },
};

export default nextConfig;
