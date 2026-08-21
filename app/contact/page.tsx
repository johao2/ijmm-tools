import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Contact Us",
  description: "Get in touch with the IJMM System engineering team behind IJMM Tools.",
  canonicalPath: "/contact",
});

export default function ContactPage() {
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Contact" }];

  return (
    <Container size="md" className="py-8 sm:py-12 text-left">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Contact Us
          </h1>
          <p className="text-sm text-[var(--text-muted)] sm:text-base leading-relaxed">
            Have feedback, bug reports, or feature suggestions for IJMM Tools?
          </p>
        </div>

        <Card padding="lg" className="space-y-4 border-[var(--border)] text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          <h2 className="text-base font-bold text-[var(--text)]">IJMM System Engineering</h2>
          <p>
            IJMM Tools is actively maintained and engineered by <strong className="font-semibold text-[var(--text)]">IJMM System</strong>.
            We appreciate user feedback as we expand our library of free digital tools.
          </p>
          <p className="pt-2">
            For technical inquiries or platform suggestions, please contact our development team at:
            <br />
            <strong className="text-[var(--primary)] font-semibold">dev@ijmmsystem.com</strong>
          </p>
        </Card>
      </div>
    </Container>
  );
}
