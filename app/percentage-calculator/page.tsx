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
  title: "Calculadora de Porcentajes Online Gratis",
  description:
    "Calcula porcentajes, incrementos, decrementos, diferencias porcentuales y descuentos de forma rápida, gratuita y precisa.",
  canonicalPath: "/percentage-calculator",
  keywords: [
    "calculadora de porcentajes",
    "calcular porcentaje",
    "cambio porcentual",
    "incremento porcentual",
    "decremento porcentual",
    "diferencia porcentual",
    "calculadora de descuentos",
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
    name: "Calculadora de Porcentajes",
    url: `${BASE_URL}/percentage-calculator`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requiere JavaScript",
    description: tool?.description || "Calculadora de porcentajes gratuita por IJMM System.",
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
        text: `${faq.answer} ${faq.formula ? `Fórmula: ${faq.formula}` : ""}`,
      },
    })),
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Calculadoras", href: "/categories/calculators" },
    { label: "Calculadora de Porcentajes" },
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
            Calculadora de Porcentajes
          </h1>
          <p className="text-sm text-[var(--text-muted)] sm:text-base max-w-2xl leading-relaxed">
            Calculadora de porcentajes online gratuita, rápida y privada desarrollada por IJMM System.
            Calcula el porcentaje de un número, incrementos, decrementos, diferencias porcentuales y descuentos en tiendas.
          </p>
        </div>

        {/* Interactive Client Calculator Form */}
        <section aria-label="Herramienta Calculadora de Porcentajes" className="mb-12">
          <PercentageCalculatorForm />
        </section>

        {/* AEO / GEO Educational Content Section */}
        <article className="space-y-10 border-t border-[var(--border)] pt-10 text-left">
          {/* Section: How to Calculate a Percentage */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              ¿Cómo calcular un porcentaje?
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Un porcentaje representa una fracción de 100. Calcular porcentajes es una habilidad matemática diaria esencial
              utilizada en finanzas personales, descuentos comerciales, análisis de datos y estadísticas académicas.
            </p>
          </section>

          {/* Section: Percentage Formulas */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Fórmulas de porcentaje
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card padding="md" variant="outline">
                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Porcentaje de un valor</h3>
                <code className="block bg-[var(--surface-secondary)] p-2 text-xs font-mono rounded-xs text-[var(--primary)] mb-2">
                  Resultado = Total × (Porcentaje / 100)
                </code>
                <p className="text-xs text-[var(--text-muted)]">
                  Multiplica el valor total por la tasa porcentual dividida entre 100.
                </p>
              </Card>

              <Card padding="md" variant="outline">
                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Relación porcentual</h3>
                <code className="block bg-[var(--surface-secondary)] p-2 text-xs font-mono rounded-xs text-[var(--primary)] mb-2">
                  Porcentaje = (Parte / Total) × 100
                </code>
                <p className="text-xs text-[var(--text-muted)]">
                  Divide la parte entre el total completo y multiplica por 100.
                </p>
              </Card>

              <Card padding="md" variant="outline">
                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Porcentaje de incremento</h3>
                <code className="block bg-[var(--surface-secondary)] p-2 text-xs font-mono rounded-xs text-[var(--primary)] mb-2">
                  Incremento % = ((Nuevo - Original) / Original) × 100
                </code>
                <p className="text-xs text-[var(--text-muted)]">
                  Mide el porcentaje de crecimiento respecto al valor inicial.
                </p>
              </Card>

              <Card padding="md" variant="outline">
                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Porcentaje de decremento</h3>
                <code className="block bg-[var(--surface-secondary)] p-2 text-xs font-mono rounded-xs text-[var(--primary)] mb-2">
                  Decremento % = ((Original - Nuevo) / Original) × 100
                </code>
                <p className="text-xs text-[var(--text-muted)]">
                  Mide el porcentaje de reducción respecto al valor inicial.
                </p>
              </Card>
            </div>
          </section>

          {/* Section: Real-World Examples */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Ejemplos prácticos
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              <Card padding="md" variant="flat">
                <p className="font-semibold text-[var(--text)] mb-1">Ejemplo 1: Calcular una propina del 15% en una cuenta de $250</p>
                <p className="mb-2">Sustitución en la fórmula: $250 × (15 / 100) = $250 × 0.15 = $37.50</p>
                <p className="text-[var(--primary)] font-medium">Resultado: El monto de la propina es $37.50.</p>
              </Card>

              <Card padding="md" variant="flat">
                <p className="font-semibold text-[var(--text)] mb-1">Ejemplo 2: Aumento de precio de $100 a $125</p>
                <p className="mb-2">Sustitución en la fórmula: ((125 - 100) / 100) × 100 = (25 / 100) × 100 = 25%</p>
                <p className="text-[var(--primary)] font-medium">Resultado: Un incremento de precio del 25%.</p>
              </Card>
            </div>
          </section>

          {/* Section: Frequently Asked Questions */}
          {faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
                Preguntas frecuentes
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <Card key={idx} padding="md" variant="outline" className="space-y-2">
                    <h3 className="text-sm font-bold text-[var(--text)]">{faq.question}</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{faq.answer}</p>
                    {faq.formula && (
                      <div className="text-xs bg-[var(--surface-secondary)] p-2 rounded-xs text-[var(--text)] font-mono">
                        Fórmula: {faq.formula}
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
              <h2 className="text-lg font-bold text-[var(--text)]">Herramientas relacionadas</h2>
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
