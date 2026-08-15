import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      // Oude domeinnaam (pre-rebrand) permanent doorsturen naar seifecon.vercel.app
      {
        source: "/:path*",
        has: [{ type: "host", value: "sana-archicons.vercel.app" }],
        destination: "https://seifecon.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
