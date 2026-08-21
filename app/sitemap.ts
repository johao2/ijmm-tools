import { MetadataRoute } from "next";
import { getActiveTools, getAllCategories } from "@/lib/tools/registry";
import { BASE_URL } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Active Category routes
  const categoryRoutes: MetadataRoute.Sitemap = getAllCategories().map((cat) => ({
    url: `${BASE_URL}/categories/${cat.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // ONLY Active tools appear in sitemap (Planned/Deprecated tools excluded)
  const toolRoutes: MetadataRoute.Sitemap = getActiveTools().map((tool) => ({
    url: `${BASE_URL}/${tool.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes];
}
