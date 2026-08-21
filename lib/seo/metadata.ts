import type { Metadata } from "next";

export interface ConstructMetadataInput {
  title?: string;
  description?: string;
  canonicalPath?: string;
  keywords?: string[];
  noIndex?: boolean;
}

const SITE_NAME = "IJMM Tools";
const COMPANY_NAME = "IJMM System";
const DEFAULT_TITLE = "IJMM Tools — Free Online Digital Tools & Calculators";
const DEFAULT_DESCRIPTION =
  "Fast, free, and privacy-focused online tools, calculators, converters, and digital utilities by IJMM System.";

// Use environment URL or fallback domain
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ijmmtools.com";

/**
 * Constructs production-grade Next.js Metadata objects with OpenGraph,
 * Canonical URL, and strict robots directives.
 */
export function constructMetadata({
  title,
  description,
  canonicalPath = "/",
  keywords = [],
  noIndex = false,
}: ConstructMetadataInput = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const fullDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      "IJMM Tools",
      "IJMM System",
      "free online tools",
      "calculators",
      "digital utilities",
      ...keywords,
    ],
    authors: [{ name: COMPANY_NAME, url: BASE_URL }],
    creator: COMPANY_NAME,
    publisher: COMPANY_NAME,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
