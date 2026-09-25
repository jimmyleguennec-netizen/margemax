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
  // En-tetes de securite sur toutes les routes. Pas de Content-Security-Policy
  // pour l'instant : elle demande une liste blanche precise (AdSense, Stripe,
  // Supabase, images AliExpress/AutOutilShop) a valider avant d'etre imposee.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // SAMEORIGIN (et non DENY) : le site ne peut etre integre en iframe
          // que par lui-meme.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
