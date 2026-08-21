import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Términos de Uso",
  description: "Términos de Uso de IJMM Tools, propiedad de IJMM SYSTEM.",
  canonicalPath: "/terms",
});

export default function TermsPage() {
  const breadcrumbs = [{ label: "Inicio", href: "/" }, { label: "Términos de Uso" }];
  const currentYear = new Date().getFullYear();

  return (
    <Container size="md" className="py-8 sm:py-12 text-left">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl">
            Términos de Uso
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Última actualización: {currentYear}</p>
        </div>

        <Card padding="lg" className="space-y-4 border-[var(--border)] text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            Bienvenido a <strong className="font-semibold text-[var(--text)]">IJMM Tools</strong>, una plataforma operada por <strong className="font-semibold text-[var(--text)]">IJMM SYSTEM</strong>.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">1. Aceptación de Términos</h2>
          <p>
            Al acceder y utilizar IJMM Tools, aceptas cumplir con los presentes Términos de Uso. Si no estás de acuerdo con alguno de ellos, te solicitamos no hacer uso de la plataforma.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">2. Exención de Responsabilidad</h2>
          <p>
            Todas las herramientas y cálculos se ofrecen &quot;tal cual&quot; con fines informativos y de conveniencia. Aunque trabajamos continuamente para garantizar la máxima precisión matemática, IJMM SYSTEM no ofrece garantías legales sobre decisiones financieras o comerciales críticas basadas en estos cálculos.
          </p>
        </Card>
      </div>
    </Container>
  );
}
