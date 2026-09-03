// src/utils/schema.js
// Google Zengin Sonuclar (Rich Results) icin schema.org JSON-LD uretir.
// Veriler tamamen veritabanindan (settings/services/reviews) gelir; bu
// sayede admin panelden yapilan degisiklikler otomatik SEO ciktisina yansir.

export function buildLocalBusinessSchema({ settings, services, reviews, aggregate, url }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: settings.businessName,
    description: settings.metaDescription,
    image: services?.[0]?.image || undefined,
    url,
    telephone: settings.phone,
    email: settings.email,
    priceRange: '₺₺₺',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressLocality: 'Istanbul',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: settings.latitude,
      longitude: settings.longitude,
    },
    sameAs: [settings.instagram, settings.tiktok, settings.facebook].filter(Boolean),
    openingHoursSpecification: (settings.hours || []).map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.day,
      description: h.value,
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Hizmetler',
      itemListElement: (services || []).map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, description: s.description },
        price: String(s.newPrice).replace(/[^\d.]/g, '') || undefined,
        priceCurrency: 'TRY',
      })),
    },
  };

  if (aggregate && aggregate.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregate.ratingValue,
      reviewCount: aggregate.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  if (reviews && reviews.length) {
    schema.review = reviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating),
        bestRating: '5',
      },
      reviewBody: r.text,
    }));
  }

  return JSON.stringify(schema);
}
