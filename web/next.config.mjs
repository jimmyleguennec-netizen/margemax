/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ae01.alicdn.com" },
      { protocol: "https", hostname: "ae04.alicdn.com" },
      { protocol: "https", hostname: "*.alicdn.com" },
    ],
  },
};

export default nextConfig;
