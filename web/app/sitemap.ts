import type { MetadataRoute } from "next";

const BASE_URL = "https://www.margemax.com";

const ROUTES: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/login", priority: 0.5, changeFrequency: "yearly" },
  { path: "/signup", priority: 0.7, changeFrequency: "yearly" },
  { path: "/cgv", priority: 0.3, changeFrequency: "yearly" },
  { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
