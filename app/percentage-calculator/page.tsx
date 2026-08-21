import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PercentageCalculatorForm from "@/components/tools/percentage-calculator/PercentageCalculatorForm";
import { constructMetadata, BASE_URL } from "@/lib/seo/metadata";
import { getToolBySlug, getRelatedTools } from "@/lib/tools/registry";
import { FAQS_BY_TOOL_ID } from "@/data/faqs";

// 1. Next.js Metadata API
export const metadata = constructMetadata({
  title: "Percentage Calculator — Free Online Calculator",
  description:
    "Fast, accurate free percentage calculator. Calculate percentage of a value, percentage increase, percentage decrease, percentage difference, and store discounts.",
  canonicalPath: "/percentage-calculator",
  keywords: [
    "percentage calculator",
    "calculate percentage",
    "percent change",
    "percentage increase",
    "percentage decrease",
    "percentage difference",
    "discount calculator",
  ],
});

export default function PercentageCalculatorPage() {
  const tool = getToolBySlug("percentage-calculator");
  const faqs = FAQS_BY_TOOL_ID["percentage-calculator"] || [];
  const relatedTools = getRelatedTools("percentage-calculator");

  // 2. Structured Data: WebApplication Schema
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Percentage Calculator",
    url: `${BASE_URL}/percentage-calculator`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    description: tool?.description || "Free online percentage calculator by IJMM System.",
    publisher: {
      "@type": "Organization",
      name: "IJMM System",
      url: BASE_URL,
    },
  };

  // 3. Structured Data: FAQPage Schema (Matches visible page content)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${faq.answer} ${faq.formula ? `Formula: ${faq.formula}` : ""}`,
      },
    })),
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Calculators", href: "/categories/calculators" },
    { label: "Percentage Calculator" },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <JsonLd data={webAppSchema} />
      {faqs.length > 0 && <JsonLd data={faqSchema} />}

      <Container size="md" className="py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Page Header */}
        <div className="mb-8 space-y-2 text-left">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Percentage Calculator
          </h1>
          <p className="text-sm text-[var(--text-muted)] sm:text-base max-w-2xl leading-relaxed">
            Free, fast, and privacy-focused percentage calculator by IJMM System.
            Calculate percentage of a number, percentage increase, decrease, percentage difference, and store discounts.
          </p>
        </div>

        {/* Interactive Client Calculator Form */}
        <section aria-label="Percentage Calculator Tool" className="mb-12">
          <PercentageCalculatorForm />
        </section>

        {/* AEO / GEO Educational Content Section */}
        <article className="space-y-10 border-t border-[var(--border)] pt-10 text-left">
          {/* Section: How to Calculate a Percentage */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              How to Calculate a Percentage
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              A percentage represents a fraction of 100. Calculating percentages is an essential daily skill
              used in finance, retail discounts, data analysis, and academic statistics.
            </p>
          </section>

          {/* Section: Percentage Formulas */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Percentage Formulas
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card padding="md" variant="outline">
                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Percentage of a Value</h3>
                <code className="block bg-[var(--surface-secondary)] p-2 text-xs font-mono rounded-xs text-[var(--primary)] mb-2">
                  Result = Total × (Percentage / 100)
                </code>
                <p className="text-xs text-[var(--text-muted)]">
                  Multiplies the total value by the percentage rate divided by 100.
                </p>
              </Card>

              <Card padding="md" variant="outline">
                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Percentage Relationship</h3>
                <code className="block bg-[var(--surface-secondary)] p-2 text-xs font-mono rounded-xs text-[var(--primary)] mb-2">
                  Percentage = (Part / Whole) × 100
                </code>
                <p className="text-xs text-[var(--text-muted)]">
                  Divides the part by the total whole and multiplies by 100.
                </p>
              </Card>

              <Card padding="md" variant="outline">
                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Percentage Increase</h3>
                <code className="block bg-[var(--surface-secondary)] p-2 text-xs font-mono rounded-xs text-[var(--primary)] mb-2">
                  Increase % = ((New - Original) / Original) × 100
                </code>
                <p className="text-xs text-[var(--text-muted)]">
                  Measures the growth percentage relative to the original value.
                </p>
              </Card>

              <Card padding="md" variant="outline">
                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Percentage Decrease</h3>
                <code className="block bg-[var(--surface-secondary)] p-2 text-xs font-mono rounded-xs text-[var(--primary)] mb-2">
                  Decrease % = ((Original - New) / Original) × 100
                </code>
                <p className="text-xs text-[var(--text-muted)]">
                  Measures the drop percentage relative to the original value.
                </p>
              </Card>
            </div>
          </section>

          {/* Section: Real-World Examples */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Real-World Examples
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              <Card padding="md" variant="flat">
                <p className="font-semibold text-[var(--text)] mb-1">Example 1: Calculating a 15% Tip on a $250 Bill</p>
                <p className="mb-2">Formula substitution: $250 × (15 / 100) = $250 × 0.15 = $37.50</p>
                <p className="text-[var(--primary)] font-medium">Result: The tip amount is $37.50.</p>
              </Card>

              <Card padding="md" variant="flat">
                <p className="font-semibold text-[var(--text)] mb-1">Example 2: Price Increase from $100 to $125</p>
                <p className="mb-2">Formula substitution: ((125 - 100) / 100) × 100 = (25 / 100) × 100 = 25%</p>
                <p className="text-[var(--primary)] font-medium">Result: A 25% price increase.</p>
              </Card>
            </div>
          </section>

          {/* Section: Frequently Asked Questions */}
          {faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <Card key={idx} padding="md" variant="outline" className="space-y-2">
                    <h3 className="text-sm font-bold text-[var(--text)]">{faq.question}</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{faq.answer}</p>
                    {faq.formula && (
                      <div className="text-xs bg-[var(--surface-secondary)] p-2 rounded-xs text-[var(--text)] font-mono">
                        Formula: {faq.formula}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Section: Related Tools (Only Active Tools via Tool Registry) */}
          {relatedTools.length > 0 && (
            <section className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--text)]">Related Tools</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedTools.map((relTool) => (
                  <Link key={relTool.id} href={`/${relTool.slug}`}>
                    <Card padding="md" hoverEffect variant="outline" className="h-full">
                      <h3 className="text-sm font-bold text-[var(--text)] mb-1">{relTool.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{relTool.shortDescription}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </Container>
    </>
  );
}
