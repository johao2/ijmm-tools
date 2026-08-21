import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Terms of Use",
  description: "Terms of Use for IJMM Tools, owned and operated by IJMM System.",
  canonicalPath: "/terms",
});

export default function TermsPage() {
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Terms of Use" }];

  return (
    <Container size="md" className="py-8 sm:py-12 text-left">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl">
            Terms of Use
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Last updated: 2026</p>
        </div>

        <Card padding="lg" className="space-y-4 border-[var(--border)] text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            Welcome to <strong className="font-semibold text-[var(--text)]">IJMM Tools</strong>, owned and operated by <strong className="font-semibold text-[var(--text)]">IJMM System</strong>.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">1. Acceptance of Terms</h2>
          <p>
            By accessing and using IJMM Tools, you agree to comply with and be bound by these Terms of Use. If you do not agree, please do not use the platform.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">2. Disclaimer of Warranties</h2>
          <p>
            All tools and calculations are provided on an &quot;as is&quot; and &quot;as available&quot; basis for informational and convenience purposes only. While we strive for mathematical accuracy, IJMM System provides no warranty regarding calculations for critical financial or legal decisions.
          </p>
        </Card>
      </div>
    </Container>
  );
}
