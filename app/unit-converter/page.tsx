import Link from "next/link";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import UnitConverterForm from "@/components/tools/unit-converter/UnitConverterForm";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import { FAQS_BY_TOOL_ID } from "@/data/faqs";
import { BASE_URL, constructMetadata } from "@/lib/seo/metadata";
import { getRelatedTools, getToolBySlug } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "Conversor de Unidades Online Gratis",
  description:
    "Convierte longitud, peso, temperatura, área y volumen entre unidades métricas e imperiales de forma rápida y precisa.",
  canonicalPath: "/unit-converter",
  keywords: [
    "conversor de unidades",
    "convertir medidas",
    "metros a pies",
    "kilogramos a libras",
    "Celsius a Fahrenheit",
  ],
});

const CONVERSION_GROUPS = [
  {
    title: "Longitud",
    description: "Milímetros, centímetros, metros, kilómetros, pulgadas, pies, yardas y millas.",
  },
  {
    title: "Peso y masa",
    description: "Miligramos, gramos, kilogramos, toneladas métricas, onzas y libras.",
  },
  {
    title: "Temperatura",
    description: "Grados Celsius, grados Fahrenheit y Kelvin, con validación del cero absoluto.",
  },
  {
    title: "Área",
    description: "Centímetros, metros y kilómetros cuadrados, hectáreas, pies cuadrados y acres.",
  },
  {
    title: "Volumen",
    description: "Mililitros, litros, metros cúbicos y medidas estadounidenses de cocina y capacidad.",
  },
];

export default function UnitConverterPage() {
  const tool = getToolBySlug("unit-converter");
  const faqs = FAQS_BY_TOOL_ID["unit-converter"] ?? [];
  const relatedTools = getRelatedTools("unit-converter");
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Conversor de Unidades",
    url: `${BASE_URL}/unit-converter`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requiere JavaScript",
    description: tool?.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: {
      "@type": "Organization",
      name: "IJMM System",
      url: "https://ijmmsystem.com",
    },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={faqSchema} />
      <Container size="lg" className="py-8 sm:py-12">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Conversores", href: "/categories/converters" },
            { label: "Conversor de Unidades" },
          ]}
          className="mb-6"
        />

        <header className="mb-8 max-w-3xl space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Conversor de Unidades
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Convierte medidas métricas e imperiales de longitud, masa, temperatura, área y volumen. Selecciona las unidades, introduce un valor y obtén el resultado al instante.
          </p>
        </header>

        <section aria-label="Herramienta para convertir unidades" className="mb-12">
          <UnitConverterForm />
        </section>

        <AdPlaceholder placement="middle" />

        <article className="space-y-10 border-t border-[var(--border)] pt-10">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Conversiones disponibles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CONVERSION_GROUPS.map((group) => (
                <Card key={group.title} variant="flat" padding="md">
                  <h3 className="mb-1 text-sm font-bold text-[var(--text)]">{group.title}</h3>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{group.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Cómo usar el conversor
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
              <li>Selecciona la categoría de medida que necesitas.</li>
              <li>Escribe el valor y elige las unidades de origen y destino.</li>
              <li>Pulsa “Convertir” para ver el resultado y copiarlo.</li>
            </ol>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              El botón de intercambio invierte las dos unidades sin obligarte a buscarlas otra vez. Puedes escribir decimales con punto o coma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Equivalencias frecuentes
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "1 pulgada = 2.54 centímetros",
                "1 pie = 0.3048 metros",
                "1 milla = 1.609344 kilómetros",
                "1 libra = 0.45359237 kilogramos",
                "1 hectárea = 10,000 metros cuadrados",
                "1 galón estadounidense = 3.785411784 litros",
              ].map((equivalence) => (
                <Card key={equivalence} variant="outline" padding="md">
                  <p className="text-sm font-semibold text-[var(--text)]">{equivalence}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Precisión y privacidad
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Las equivalencias internacionales definidas se conservan con precisión interna y el resultado se presenta con hasta diez decimales. Todo ocurre localmente en tu navegador: IJMM Tools no recibe ni almacena las cantidades introducidas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Preguntas frecuentes</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <Card key={faq.question} variant="outline" padding="md">
                  <h3 className="mb-2 text-sm font-bold text-[var(--text)]">{faq.question}</h3>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </section>

          {relatedTools.length > 0 && (
            <section className="space-y-4 border-t border-[var(--border)] pt-6">
              <h2 className="text-lg font-bold text-[var(--text)]">Herramientas relacionadas</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedTools.map((relatedTool) => (
                  <Link key={relatedTool.id} href={`/${relatedTool.slug}`}>
                    <Card hoverEffect variant="outline" padding="md" className="h-full">
                      <h3 className="mb-1 text-sm font-bold text-[var(--text)]">{relatedTool.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{relatedTool.shortDescription}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <AdPlaceholder placement="bottom" />
      </Container>
    </>
  );
}
