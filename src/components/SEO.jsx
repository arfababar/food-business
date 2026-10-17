import { Helmet } from "react-helmet-async";
import { BUSINESS_CONFIG } from "../config/business";

export default function SEO({
  title,
  description = BUSINESS_CONFIG.description,
  image = "/favicon.svg",
  url = BUSINESS_CONFIG.siteUrl || "https://crunchbox.com",
}) {
  const fullTitle = title
    ? `${title} | ${BUSINESS_CONFIG.name} (${BUSINESS_CONFIG.city})`
    : `${BUSINESS_CONFIG.name} | Crispy Zingers, Burgers & Fast Food in ${BUSINESS_CONFIG.city}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FastFoodRestaurant",
    name: BUSINESS_CONFIG.name,
    description: BUSINESS_CONFIG.description,
    url: BUSINESS_CONFIG.siteUrl || "https://crunchbox.com",
    telephone: BUSINESS_CONFIG.hotlineDisplay,
    servesCuisine: "Fast Food, Burgers, Loaded Fries",
    priceRange: "PKR 120 - 2200",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Main Commercial Market, Model Town",
      addressLocality: BUSINESS_CONFIG.city,
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "12:00",
        closes: "01:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "14:00",
        closes: "02:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "12:00",
        closes: "02:00",
      },
    ],
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#d97706" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
