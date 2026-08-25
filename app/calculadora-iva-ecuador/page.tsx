import Link from "next/link";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import VatCalculatorForm from "@/components/tools/vat-calculator/VatCalculatorForm";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import { FAQS_BY_TOOL_ID } from "@/data/faqs";
import { BASE_URL, constructMetadata } from "@/lib/seo/metadata";
import { getRelatedTools, getToolBySlug } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "Calculadora de IVA Ecuador 15% Online",
  description:
    "Calcula el IVA de Ecuador al 15%, agrega el impuesto a un subtotal o extrae IVA y base imponible desde un total.",
  canonicalPath: "/calculadora-iva-ecuador",
  keywords: [
    "calculadora IVA Ecuador",
    "calcular IVA 15%",
    "sacar IVA",
    "extraer IVA",
    "IVA Ecuador",
  ],
});

const SRI_IVA_URL = "https://www.sri.gob.ec/impuesto-al-valor-agregado-iva";
const SRI_RATE_CIRCULAR_URL =
  "https://www.sri.gob.ec/o/sri-portlet-biblioteca-alfresco-internet/descargar?id=ee088145-61f4-4926-8f32-646ec8369f79&nombre=NAC-DGECCGC26-00000002.pdf";
const SRI_TOURISM_URL =
  "https://www.sri.gob.ec/detalle-noticias?idnoticia=1296&marquesina=1";

export default function EcuadorVatCalculatorPage() {
  const tool = getToolBySlug("calculadora-iva-ecuador");
  const faqs = FAQS_BY_TOOL_ID["calculadora-iva-ecuador"] ?? [];
  const relatedTools = getRelatedTools("calculadora-iva-ecuador");
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Calculadora de IVA Ecuador",
    url: `${BASE_URL}/calculadora-iva-ecuador`,
    applicationCategory: "FinanceApplication",
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
            { label: "Herramientas para Ecuador", href: "/categories/ecuador-tools" },
            { label: "Calculadora de IVA Ecuador" },
          ]}
          className="mb-6"
        />

        <header className="mb-8 max-w-3xl space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Calculadora de IVA Ecuador
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Calcula cuánto IVA debes agregar a un subtotal o separa la base imponible y el impuesto incluido en un total. La tarifa general predeterminada es 15%.
          </p>
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Tarifa y fuentes verificadas el 25 de agosto de 2026.
          </p>
        </header>

        <section aria-label="Calculadora de IVA para Ecuador" className="mb-12">
          <VatCalculatorForm />
        </section>

        <AdPlaceholder placement="middle" />

        <article className="space-y-10 border-t border-[var(--border)] pt-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Tarifa de IVA vigente en Ecuador
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              La tarifa general vigente es 15%. El Servicio de Rentas Internas también contempla operaciones con tarifa 0% y una tarifa de 5% para determinados materiales de construcción. La reducción al 8% para actividades turísticas solo aplica cuando existe autorización oficial y durante las fechas señaladas.
            </p>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Consulta la información del{" "}
              <a className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline" href={SRI_IVA_URL} target="_blank" rel="noreferrer">
                IVA en el SRI
              </a>
              , la{" "}
              <a className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline" href={SRI_RATE_CIRCULAR_URL} target="_blank" rel="noreferrer">
                circular oficial sobre la tarifa vigente
              </a>{" "}
              y, cuando corresponda, la{" "}
              <a className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline" href={SRI_TOURISM_URL} target="_blank" rel="noreferrer">
                resolución temporal para turismo
              </a>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Cómo calcular el IVA del 15%
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card variant="flat" padding="md">
                <h3 className="mb-2 text-sm font-bold text-[var(--text)]">Agregar IVA</h3>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  IVA = subtotal × 0.15. Luego, total = subtotal + IVA. Por ejemplo, sobre $100 el IVA es $15 y el total es $115.
                </p>
              </Card>
              <Card variant="flat" padding="md">
                <h3 className="mb-2 text-sm font-bold text-[var(--text)]">Extraer IVA</h3>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  Subtotal = total ÷ 1.15. Luego, IVA = total − subtotal. De un total de $115 se obtiene una base de $100 y $15 de IVA.
                </p>
              </Card>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
              Precisión, privacidad y alcance
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Los cálculos se realizan localmente en tu navegador y se redondean al centavo más cercano. IJMM Tools no recibe ni almacena los montos introducidos. El resultado es orientativo: confirma la clasificación tributaria de tu operación y los comprobantes exigidos con el SRI o un profesional autorizado.
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
