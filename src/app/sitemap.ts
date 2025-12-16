import { MetadataRoute } from 'next'

const LAST_MODIFIED = new Date('2025-01-01');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://solarclose.pages.dev',
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
