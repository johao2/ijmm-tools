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
const DEFAULT_TITLE = "IJMM Tools — Herramientas online gratuitas para tus tareas diarias";
const DEFAULT_DESCRIPTION =
  "Calcula, convierte, genera y resuelve tareas rápidamente con herramientas gratuitas, rápidas y privadas en tu navegador. Desarrollado por IJMM System.";

// Use environment URL or fallback domain
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tools.ijmmsystem.com";

/**
 * Constructs production-grade Next.js Metadata objects with OpenGraph,
 * Canonical URL, and strict robots directives in Spanish.
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
      "herramientas online gratuitas",
      "calculadoras gratis",
      "utilidades digitales",
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
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description: fullDescription,
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
