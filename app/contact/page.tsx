import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Contacto",
  description: "Ponte en contacto con el equipo de ingeniería de IJMM System detrás de IJMM Tools.",
  canonicalPath: "/contact",
});

export default function ContactPage() {
  const breadcrumbs = [{ label: "Inicio", href: "/" }, { label: "Contacto" }];

  return (
    <Container size="md" className="py-8 sm:py-12 text-left">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Contacto
          </h1>
          <p className="text-sm text-[var(--text-muted)] sm:text-base leading-relaxed">
            ¿Tienes sugerencias, consultas o comentarios sobre IJMM Tools?
          </p>
        </div>

        <Card padding="lg" className="space-y-4 border-[var(--border)] text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          <h2 className="text-base font-bold text-[var(--text)]">Equipo de Ingeniería IJMM System</h2>
          <p>
            IJMM Tools es mantenido activamente por el equipo de ingeniería de <strong className="font-semibold text-[var(--text)]">IJMM System</strong>.
            Apreciamos los comentarios de nuestros usuarios a medida que ampliamos nuestro catálogo de utilidades gratuitas.
          </p>
          <p className="pt-2">
            Para consultas técnicas o sugerencias sobre la plataforma, contáctanos a través de:
            <br />
            <strong className="text-[var(--primary)] font-semibold">dev@ijmmsystem.com</strong>
          </p>
        </Card>
      </div>
    </Container>
  );
}
