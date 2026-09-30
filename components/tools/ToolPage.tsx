import Link from "next/link";
import type { ReactNode } from "react";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import { FAQS_BY_TOOL_ID } from "@/data/faqs";
import { BASE_URL } from "@/lib/seo/metadata";
import { getCategoryById, getRelatedTools, getToolBySlug } from "@/lib/tools/registry";

export interface ToolPageSection {
  title: string;
  content: ReactNode;
}

export interface ToolPageProps {
  /** Slug registrado en data/tools.ts */
  slug: string;
  /** Texto introductorio bajo el título */
  intro: string;
  /** Formulario interactivo de la herramienta */
  children: ReactNode;
  /** Pasos de uso (se muestran como lista numerada) */
  howTo?: string[];
  /** Secciones de contenido adicionales (explicación, fórmulas, ejemplos) */
  sections?: ToolPageSection[];
}

/**
 * Plantilla común de las páginas de herramientas: migas de pan, datos estructurados,
 * herramienta, anuncios, contenido explicativo, preguntas frecuentes y relacionadas.
 */
export default function ToolPage({ slug, intro, children, howTo, sections = [] }: ToolPageProps) {
  const tool = getToolBySlug(slug);
  if (!tool) throw new Error(`Herramienta no registrada: ${slug}`);
  const category = getCategoryById(tool.categoryId);
  const faqs = FAQS_BY_TOOL_ID[tool.id] ?? [];
  const relatedTools = getRelatedTools(tool.id);

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: `${BASE_URL}/${tool.slug}`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    browserRequirements: "Requiere JavaScript",
    description: tool.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "IJMM System", url: "https://ijmmsystem.com" },
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
      {faqs.length > 0 && <JsonLd data={faqSchema} />}
      <Container size="lg" className="py-8 sm:py-12">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
            { label: tool.name },
          ]}
          className="mb-6"
        />

        <header className="mb-8 max-w-3xl space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">{tool.name}</h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">{intro}</p>
        </header>

        <section aria-label={tool.name} className="mb-12">
          {children}
        </section>

        <AdPlaceholder placement="middle" />

        <article className="space-y-10 border-t border-[var(--border)] pt-10">
          {howTo && howTo.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Cómo usar la herramienta</h2>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
                {howTo.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">{section.title}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">{section.content}</div>
            </section>
          ))}

          {faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Preguntas frecuentes</h2>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <Card key={faq.question} variant="outline" padding="md">
                    <h3 className="mb-2 text-sm font-bold text-[var(--text)]">{faq.question}</h3>
                    <p className="text-xs leading-relaxed text-[var(--text-muted)]">{faq.answer}</p>
                    {faq.formula && (
                      <p className="mt-2 rounded-md bg-[var(--surface-secondary)] px-3 py-2 font-mono text-xs text-[var(--text)]">{faq.formula}</p>
                    )}
                    {faq.example && <p className="mt-2 text-xs italic text-[var(--text-muted)]">Ejemplo: {faq.example}</p>}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {relatedTools.length > 0 && (
            <section className="space-y-4 border-t border-[var(--border)] pt-6">
              <h2 className="text-lg font-bold text-[var(--text)]">Herramientas relacionadas</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedTools.map((related) => (
                  <Link key={related.id} href={`/${related.slug}`}>
                    <Card hoverEffect variant="outline" padding="md" className="h-full">
                      <h3 className="mb-1 text-sm font-bold text-[var(--text)]">{related.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{related.shortDescription}</p>
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
