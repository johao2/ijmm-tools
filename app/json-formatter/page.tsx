import Link from "next/link";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import JsonFormatterTool from "@/components/tools/json-formatter/JsonFormatterTool";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import { FAQS_BY_TOOL_ID } from "@/data/faqs";
import { BASE_URL, constructMetadata } from "@/lib/seo/metadata";
import { getRelatedTools, getToolBySlug } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "Formateador, Validador y Minificador JSON Online",
  description:
    "Formatea, valida y minifica JSON gratis. Detecta errores, copia o descarga el resultado y procesa todo localmente en tu navegador.",
  canonicalPath: "/json-formatter",
  keywords: [
    "formateador JSON",
    "validador JSON",
    "minificar JSON",
    "JSON formatter online",
    "embellecer JSON",
  ],
});

export default function JsonFormatterPage() {
  const tool = getToolBySlug("json-formatter");
  const faqs = FAQS_BY_TOOL_ID["json-formatter"] ?? [];
  const relatedTools = getRelatedTools("json-formatter");
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Formateador, Validador y Minificador JSON",
    url: `${BASE_URL}/json-formatter`,
    applicationCategory: "DeveloperApplication",
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
            { label: "Herramientas para desarrolladores", href: "/categories/developer-tools" },
            { label: "Formateador JSON" },
          ]}
          className="mb-6"
        />

        <header className="mb-8 max-w-3xl space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Formateador, Validador y Minificador JSON
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Ordena JSON para leerlo mejor, comprueba su sintaxis o elimina espacios para reducir su tamaño. Todo se procesa de forma privada en tu navegador.
          </p>
        </header>

        <section aria-label="Herramienta para procesar JSON" className="mb-12">
          <JsonFormatterTool />
        </section>

        <AdPlaceholder placement="middle" />

        <article className="space-y-10 border-t border-[var(--border)] pt-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">¿Qué hace un formateador JSON?</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              JSON es un formato de texto utilizado para intercambiar datos entre aplicaciones y servicios. El formateador agrega saltos de línea y sangría sin alterar los valores; el validador comprueba que la sintaxis cumpla el estándar, y el minificador elimina espacios innecesarios para producir una versión compacta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Ejemplo de JSON formateado</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card variant="outline" padding="md">
                <h3 className="mb-3 text-sm font-bold text-[var(--text)]">Entrada compacta</h3>
                <pre className="overflow-x-auto rounded bg-[var(--surface-secondary)] p-3 font-mono text-xs text-[var(--text)]">{`{"usuario":"Ana","activo":true}`}</pre>
              </Card>
              <Card variant="outline" padding="md">
                <h3 className="mb-3 text-sm font-bold text-[var(--text)]">Salida legible</h3>
                <pre className="overflow-x-auto rounded bg-[var(--surface-secondary)] p-3 font-mono text-xs text-[var(--text)]">{`{\n  "usuario": "Ana",\n  "activo": true\n}`}</pre>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Errores JSON frecuentes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Comillas incorrectas", "JSON usa comillas dobles; las comillas simples no son válidas."],
                ["Comas finales", "El último elemento de un objeto o arreglo no puede terminar con coma."],
                ["Propiedades sin comillas", "Cada nombre de propiedad debe estar encerrado entre comillas dobles."],
                ["Comentarios incluidos", "JSON estándar no permite comentarios // ni bloques /* ... */."],
              ].map(([title, description]) => (
                <Card key={title} variant="flat" padding="md">
                  <h3 className="mb-1 text-sm font-bold text-[var(--text)]">{title}</h3>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Procesamiento privado y seguro</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              La herramienta funciona completamente en el dispositivo. El texto no se carga a IJMM System ni se guarda en una base de datos. Aun así, evita pegar secretos en dispositivos compartidos y borra el contenido cuando termines.
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
