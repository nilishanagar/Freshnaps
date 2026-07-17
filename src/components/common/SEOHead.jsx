import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Freshnaps';
const SITE_URL = 'https://freshnapsmattress.com';
const DEFAULT_OG_IMAGE = 'https://freshnapsmattress.com/favicon.png';

/**
 * Reusable SEO Head component for per-page meta tags.
 *
 * @param {string}  title        — Page title (will be appended with site name)
 * @param {string}  description  — Meta description (max ~155 chars)
 * @param {string}  path         — URL path (e.g., '/shop')
 * @param {string}  ogImage      — Open Graph image URL
 * @param {string}  ogType       — Open Graph type (default: 'website')
 * @param {string}  keywords     — Comma-separated keywords
 * @param {boolean} noindex      — Set true for pages that should not be indexed
 * @param {object}  jsonLd       — JSON-LD structured data object(s) — single or array
 * @param {string}  canonicalUrl — Override canonical URL (defaults to SITE_URL + path)
 */
const SEOHead = ({
  title,
  description,
  path = '',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  keywords = '',
  noindex = false,
  jsonLd = null,
  canonicalUrl = '',
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Premium Bedding & Home Comfort`;
  const canonical = canonicalUrl || `${SITE_URL}${path}`;

  // Support both single and array of JSON-LD schemas
  const schemas = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : [];

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;

// ─── Shared JSON-LD Schemas ───

/** Organization / LocalBusiness schema for global use */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Freshnaps',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  description: 'Premium bedding and home comfort products — mattresses, pillows, bedsheets, comforters and more.',
  telephone: '+919057204097',
  email: 'freshnapsmattress@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Royal Marwadi Near Roop Laxmi Furniture, Mandi Road',
    addressLocality: 'Sawai Madhopur',
    addressRegion: 'Rajasthan',
    postalCode: '322001',
    addressCountry: 'IN',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '10:00',
      closes: '17:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/freshnapsmattress',
  ],
};

/** WebSite schema with sitelinks search box */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Freshnaps',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/**
 * Generate a Product JSON-LD schema from a product object.
 */
export const buildProductSchema = (product) => {
  if (!product) return null;

  const image = product.images?.find(img => img.isPrimary)?.url
    || product.images?.[0]?.url
    || DEFAULT_OG_IMAGE;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description?.replace(/<[^>]+>/g, '').slice(0, 300) || '',
    image,
    url: `${SITE_URL}/product/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Freshnaps',
    },
    sku: product.sku || '',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Freshnaps',
      },
    },
  };

  // Add aggregate rating if reviews exist
  if (product.numReviews > 0 && product.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.numReviews,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
};

/**
 * Generate BreadcrumbList JSON-LD schema.
 * @param {Array<{name: string, url: string}>} items
 */
export const buildBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url ? `${SITE_URL}${item.url}` : undefined,
  })),
});
