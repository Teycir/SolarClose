import { MetadataRoute } from 'next'

/** Last modification date for sitemap entries */
const LAST_MODIFIED = new Date('2025-01-01');

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://solarclose.pages.dev';
  const languages = ['en', 'es', 'it', 'fr', 'de'];
  
  return [
    {
      url: baseUrl,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: baseUrl,
          es: `${baseUrl}?lang=es`,
          it: `${baseUrl}?lang=it`,
          fr: `${baseUrl}?lang=fr`,
          de: `${baseUrl}?lang=de`,
        },
      },
    },
    ...languages.map(lang => ({
      url: `${baseUrl}?lang=${lang}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]
}
