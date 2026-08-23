import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Política de Cookies",
  description:
    "Información sobre cookies, medición y publicidad en IJMM Tools.",
  canonicalPath: "/cookies",
});

export default function CookiesPage() {
  const currentYear = new Date().getFullYear();

  return (
    <Container size="md" className="py-8 text-left sm:py-12">
      <Breadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Política de Cookies" }]}
        className="mb-6"
      />
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl">
            Política de Cookies
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Última actualización: {currentYear}
          </p>
        </div>
        <Card
          padding="lg"
          className="space-y-4 border-[var(--border)] text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm"
        >
          <p>
            IJMM Tools prioriza tecnologías estrictamente necesarias para entregar
            el sitio, protegerlo y recordar preferencias técnicas.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">
            Publicidad y medición
          </h2>
          <p>
            Cuando la publicidad esté activa, proveedores como Google podrán usar
            cookies o tecnologías equivalentes para entregar, limitar y medir
            anuncios. La activación se realizará únicamente después de configurar
            los controles de consentimiento aplicables.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">
            Datos de las herramientas
          </h2>
          <p>
            Los números introducidos, resultados, contenidos copiados y demás datos
            procesados por las herramientas no se envían a proveedores publicitarios.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">
            Control del usuario
          </h2>
          <p>
            Cuando sea necesario solicitar consentimiento, la plataforma mostrará
            un control para aceptar, rechazar o administrar las finalidades no
            esenciales. También puedes gestionar o eliminar cookies desde tu
            navegador.
          </p>
        </Card>
      </div>
    </Container>
  );
}
