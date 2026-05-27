// components/SEO.tsx
"use client";

import { useEffect } from "react";

export default function SEO() {
  useEffect(() => {
    // Schema markup for local business
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HomeAndConstructionBusiness",
      "name": "OSR Pros",
      "alternateName": "One Square Roofing & Remodeling",
      "description": "Full-service roofing, remodeling, and general contracting serving Greensboro, Charlotte, High Point, Winston-Salem, and surrounding areas. Family-owned since 2006.",
      "url": "https://osrpros.com",
      "logo": "https://osrpros.com/logo.png",
      "image": "https://osrpros.com/images/hero-image.jpg",
      "telephone": "+17043034112",
      "email": "contact@osrpros.com",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Business Street",
        "addressLocality": "Greensboro",
        "addressRegion": "NC",
        "postalCode": "27401",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 36.0726,
        "longitude": -79.7920
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "09:00",
          "closes": "15:00"
        }
      ],
      "areaServed": [
        "Greensboro",
        "Charlotte",
        "High Point",
        "Winston-Salem",
        "Lake Norman",
        "Ballantyne",
        "Huntersville",
        "Matthews",
        "Cornelius",
        "Davidson",
        "Pineville",
        "Mint Hill",
        "Indian Trail",
        "Kernersville",
        "Clemmons",
        "Lewisville",
        "Jamestown",
        "Archdale",
        "Thomasville",
        "Burlington",
        "Asheboro",
        "Concord",
        "Kannapolis",
        "Salisbury",
        "Mooresville"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Construction Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Roofing",
              "description": "Residential and commercial roofing installation and repair"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Kitchen Remodeling",
              "description": "Complete kitchen renovations and custom cabinetry"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Bathroom Remodeling",
              "description": "Luxury bathroom transformations and spa-like showers"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Deck & Fence Construction",
              "description": "Custom decks, fences, and outdoor living spaces"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Commercial Build-outs",
              "description": "Nail salons, retail spaces, offices, and restaurants"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "287"
      }
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}