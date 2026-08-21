import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "About Us",
  description: "Learn about IJMM Tools, a digital utilities platform owned and engineered by IJMM System.",
  canonicalPath: "/about",
});

export default function AboutPage() {
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "About" }];

  return (
    <Container size="md" className="py-8 sm:py-12 text-left">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            About IJMM Tools
          </h1>
          <p className="text-sm text-[var(--text-muted)] sm:text-base leading-relaxed">
            Free, fast, and privacy-focused digital tools built for everyday productivity.
          </p>
        </div>

        <Card padding="lg" className="space-y-4 border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">Our Mission</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            IJMM Tools is an engineering project owned by <strong className="font-semibold text-[var(--text)]">IJMM System</strong>.
            Our goal is to build a modern, utility-first digital platform delivering reliable calculators, converters, and developer tools
            that execute directly inside your browser without backend delays or mandatory user sign-ups.
          </p>

          <h2 className="text-lg font-bold text-[var(--text)] pt-2">Engineering Principles</h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)]">
            <li><strong>Speed & Performance:</strong> Browser-first computation with minimal JavaScript payloads.</li>
            <li><strong>Data Privacy:</strong> Your data remains strictly local in your browser.</li>
            <li><strong>Accessibility & Simplicity:</strong> Clean, uncluttered UI built for clarity and WCAG standards.</li>
          </ul>
        </Card>
      </div>
    </Container>
  );
}
