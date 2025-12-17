export function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SolarClose',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Free solar proposal calculator for sales reps. Generate professional PDF proposals instantly. Works offline, no signup required.',
    url: 'https://solarclose.pages.dev',
    author: {
      '@type': 'Person',
      name: 'Teycir Ben Soltane',
      url: 'https://teycirbensoltane.tn',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
    featureList: [
      'Offline functionality',
      'PDF proposal generation',
      '25-year savings calculation',
      'ROI calculator',
      'Multi-language support',
      'No signup required',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
