import Link from "next/link";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PasswordGeneratorTool from "@/components/tools/password-generator/PasswordGeneratorTool";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import { FAQS_BY_TOOL_ID } from "@/data/faqs";
import { BASE_URL, constructMetadata } from "@/lib/seo/metadata";
import { getRelatedTools, getToolBySlug } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "Generador de Contraseñas Seguras Online",
  description:
    "Genera contraseñas fuertes y aleatorias gratis con criptografía segura. Personaliza longitud y caracteres sin enviar datos a servidores.",
  canonicalPath: "/password-generator",
  keywords: [
    "generador de contraseñas",
    "contraseña segura",
    "crear contraseña fuerte",
    "password generator",
    "generador de claves",
  ],
});

export default function PasswordGeneratorPage() {
  const tool = getToolBySlug("password-generator");
  const faqs = FAQS_BY_TOOL_ID["password-generator"] ?? [];
  const relatedTools = getRelatedTools("password-generator");
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Generador de Contraseñas Seguras",
    url: `${BASE_URL}/password-generator`,
    applicationCategory: "SecurityApplication",
    operatingSystem: "All",
    browserRequirements: "Requiere JavaScript y Web Crypto API",
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
            { label: "Generadores", href: "/categories/generators" },
            { label: "Generador de Contraseñas" },
          ]}
          className="mb-6"
        />

        <header className="mb-8 max-w-3xl space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Generador de Contraseñas Seguras
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Crea contraseñas fuertes, aleatorias y personalizadas usando criptografía segura del navegador. La generación es privada y no requiere enviar información a servidores.
          </p>
        </header>

        <section aria-label="Herramienta para generar contraseñas seguras" className="mb-12">
          <PasswordGeneratorTool />
        </section>

        <AdPlaceholder placement="middle" />

        <article className="space-y-10 border-t border-[var(--border)] pt-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">¿Cómo crear una contraseña segura?</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Una contraseña segura debe ser larga, impredecible y exclusiva para cada cuenta. La longitud suele aportar más protección que sustituir letras de palabras conocidas. Para servicios importantes, utiliza al menos 16 caracteres y combina mayúsculas, minúsculas, números y símbolos cuando el sitio los admita.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Buenas prácticas de seguridad</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Una clave por cuenta", "Nunca reutilices la misma contraseña en servicios diferentes."],
                ["Usa un gestor", "Guarda claves largas y únicas en un gestor de contraseñas confiable."],
                ["Activa el segundo factor", "La autenticación multifactor agrega una barrera adicional frente al robo de claves."],
                ["Evita datos personales", "No construyas contraseñas con nombres, fechas, teléfonos o información pública."],
              ].map(([title, description]) => (
                <Card key={title} variant="flat" padding="md">
                  <h3 className="mb-1 text-sm font-bold text-[var(--text)]">{title}</h3>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">¿Cómo funciona este generador?</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              IJMM Tools utiliza <code className="rounded bg-[var(--surface-secondary)] px-1.5 py-0.5 font-mono text-xs">crypto.getRandomValues</code>, la fuente de aleatoriedad criptográfica incorporada en navegadores modernos. También evita el sesgo de módulo al seleccionar caracteres y garantiza al menos un carácter de cada grupo elegido. No utiliza <code className="rounded bg-[var(--surface-secondary)] px-1.5 py-0.5 font-mono text-xs">Math.random()</code>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Fortaleza y entropía estimada</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              La entropía expresa de forma aproximada cuántas combinaciones tendría que explorar un atacante. Es una orientación matemática, no una garantía absoluta: la seguridad también depende de cómo almacenas la clave, del servicio utilizado y de si activas autenticación multifactor.
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
