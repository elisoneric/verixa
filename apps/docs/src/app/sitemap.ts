import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://docs.verixaid.com";
  const lastModified = new Date();

  const pages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/authentication", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/environments", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/bvn", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/nin", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/phone", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/government-ids", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/cac", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/nuban", priority: 0.95, changeFrequency: "weekly" as const },
    { path: "/nuban-kyc", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/biometrics-aml", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/airtime-data", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/messaging", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/smart-cache", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/balance", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/billing-api", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/idempotency", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/webhooks", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/rate-limits", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/errors", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/roadmap", priority: 0.7, changeFrequency: "weekly" as const },
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
