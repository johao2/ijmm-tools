import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy for IJMM Tools, a product by IJMM System.",
  canonicalPath: "/privacy",
});

export default function PrivacyPage() {
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Privacy Policy" }];

  return (
    <Container size="md" className="py-8 sm:py-12 text-left">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Last updated: 2026</p>
        </div>

        <Card padding="lg" className="space-y-4 border-[var(--border)] text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            At <strong className="font-semibold text-[var(--text)]">IJMM Tools</strong> (a product by <strong className="font-semibold text-[var(--text)]">IJMM System</strong>), we take user privacy seriously.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">1. Client-Side Data Processing</h2>
          <p>
            Our calculation tools (such as the Percentage Calculator) process data entirely client-side inside your browser. Your input numbers and calculations are never uploaded or transmitted to external servers.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">2. Information We Collect</h2>
          <p>
            We do not require user registration or personal account creation. Standard web server access logs (such as IP address and browser type) may be recorded by hosting infrastructure solely for technical performance and security monitoring.
          </p>
        </Card>
      </div>
    </Container>
  );
}
