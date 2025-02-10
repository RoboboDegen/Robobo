import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/game/chat/stream",
        destination: "https://robobo.vercel.app/api/game/chat/stream",
      },
      {
        source: "/api/game/chat/history",
        destination: "https://robobo.vercel.app/api/game/chat/history",
      },
    ];
  },
};

export default nextConfig;

