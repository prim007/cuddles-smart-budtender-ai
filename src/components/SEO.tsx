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
}

const SEO = ({
  title = "Cuddles - AI-Powered Cannabis Recommendations",
  description = "Transform cannabis retail with AI that recommends perfect strains based on desired effects, experience level, and preferences. 95% match accuracy, <2s response time.",
  image = "/og-image.jpg",
  url = "https://cuddles-smart-budtender-ai.lovable.app",
  type = "website",
  author = "Cuddles",
  publishedTime,
  structuredData,
}: SEOProps) => {
  const fullTitle = title.includes('Cuddles') ? title : `${title} | Cuddles`;
  const fullUrl = url.startsWith('http') ? url : `https://cuddles-smart-budtender-ai.lovable.app${url}`;
  const fullImage = image.startsWith('http') ? image : `https://cuddles-smart-budtender-ai.lovable.app${image}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Cuddles",
    "applicationCategory": "BusinessApplication",
    "description": description,
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "5300",
      "priceCurrency": "ZAR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "billingDuration": "P1M",
        "unitText": "MONTHLY"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "150",
      "bestRating": "5"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Cuddles" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
