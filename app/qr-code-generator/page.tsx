import Link from "next/link";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import QrCodeGeneratorTool from "@/components/tools/qr-code-generator/QrCodeGeneratorTool";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import { FAQS_BY_TOOL_ID } from "@/data/faqs";
import { BASE_URL, constructMetadata } from "@/lib/seo/metadata";
import { getRelatedTools, getToolBySlug } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "Generador de Códigos QR Gratis Online",
  description:
    "Crea códigos QR personalizados para enlaces, texto y Wi-Fi. Ajusta colores, descarga en PNG y procesa todo localmente.",
  canonicalPath: "/qr-code-generator",
  keywords: [
    "generador de código QR",
    "crear QR gratis",
    "código QR para Wi-Fi",
    "QR para enlace",
    "QR code generator",
  ],
});

export default function QrCodeGeneratorPage() {
  const tool = getToolBySlug("qr-code-generator");
  const faqs = FAQS_BY_TOOL_ID["qr-code-generator"] ?? [];
  const relatedTools = getRelatedTools("qr-code-generator");
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Generador de Códigos QR",
    url: `${BASE_URL}/qr-code-generator`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requiere JavaScript y Canvas",
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
            { label: "Generador de Códigos QR" },
          ]}
          className="mb-6"
        />

        <header className="mb-8 max-w-3xl space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Generador de Códigos QR
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Crea códigos QR para enlaces, textos y redes Wi-Fi. Personaliza los colores, elige la corrección de errores y descarga una imagen PNG sin enviar tus datos a servidores.
          </p>
        </header>

        <section aria-label="Herramienta para generar códigos QR" className="mb-12">
          <QrCodeGeneratorTool />
        </section>

        <AdPlaceholder placement="middle" />

        <article className="space-y-10 border-t border-[var(--border)] pt-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">¿Cómo crear un código QR?</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              Selecciona el tipo de contenido, completa los datos y pulsa “Generar código QR”. La herramienta codifica la información directamente en la matriz visual. Después puedes descargarla como PNG para compartirla digitalmente o incorporarla en un documento impreso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Usos disponibles</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Enlaces web", "Abre una página, catálogo, formulario, perfil o recurso digital."],
                ["Texto", "Comparte instrucciones, referencias, identificadores o mensajes breves."],
                ["Red Wi-Fi", "Facilita la conexión mediante SSID, seguridad y contraseña codificados."],
              ].map(([title, description]) => (
                <Card key={title} variant="flat" padding="md">
                  <h3 className="mb-1 text-sm font-bold text-[var(--text)]">{title}</h3>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Consejos para que el QR se escanee correctamente</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
              <li>Mantén el código oscuro sobre un fondo claro y no elimines el margen blanco exterior.</li>
              <li>Evita textos innecesariamente largos porque producen una matriz más densa.</li>
              <li>No deformes la imagen: conserva siempre la misma anchura y altura.</li>
              <li>Prueba el resultado en varios teléfonos antes de imprimirlo o distribuirlo.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Privacidad y códigos Wi-Fi</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              El QR se genera localmente y tus datos no se transmiten a IJMM System. Recuerda que cualquier persona que vea o escanee un QR de Wi-Fi podría obtener acceso a esa red; compártelo únicamente con personas autorizadas y cambia la contraseña cuando deje de ser necesario.
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
