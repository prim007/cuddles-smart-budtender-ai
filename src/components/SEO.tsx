import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  structuredData?: object;
  keywords?: string;
  noindex?: boolean;
}

const BASE_URL = "https://cuddles-ai.com";
const DEFAULT_IMAGE = "https://cuddles-ai.com/og-image.jpg";

const SEO = ({
  title = "Cuddles AI — Smart AI Cannabis Budtender",
  description = "Cuddles AI is the world's smartest cannabis budtender. Personalized strain recommendations, journal, scanner, and reviews — free worldwide.",
  image = DEFAULT_IMAGE,
  url = "/",
  type = "website",
  author = "Cuddles AI",
  publishedTime,
  structuredData,
  keywords = "Cuddles AI, cannabis AI, smart budtender, AI budtender, strain recommendations, cannabis technology, dispensary AI",
  noindex = false,
}: SEOProps) => {
  const fullTitle = title.includes('Cuddles') ? title : `${title} | Cuddles AI`;
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Cuddles AI",
    "alternateName": ["Cuddles", "Cuddles Smart Budtender"],
    "applicationCategory": "LifestyleApplication",
    "description": description,
    "operatingSystem": "Web",
    "url": fullUrl,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free to use with premium features available"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "150",
      "bestRating": "5"
    },
    "featureList": [
      "AI-Powered Strain Recommendations",
      "Cannabis Strain Journal",
      "Strain Scanner with Image Recognition",
      "Community Strain Reviews",
      "Tolerance Break Coach",
      "Personalized Dosage Calculator"
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Cuddles AI" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Hreflang — multi-region English targeting (matches real traffic) */}
      <link rel="alternate" hrefLang="en" href={fullUrl} />
      <link rel="alternate" hrefLang="en-us" href={fullUrl} />
      <link rel="alternate" hrefLang="en-gb" href={fullUrl} />
      <link rel="alternate" hrefLang="en-za" href={fullUrl} />
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />

      {/* Robots — encourage rich previews, or block indexing for private pages */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;