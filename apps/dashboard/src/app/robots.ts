import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://verixaid.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/nin-verification-api",
          "/bvn-verification-api",
          "/nin-slip-generator",
          "/pricing",
          "/privacy",
          "/terms",
          "/login",
          "/register",
        ],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/onboarding/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
