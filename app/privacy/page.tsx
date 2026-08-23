import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Políticas de Privacidad",
  description: "Políticas de Privacidad de IJMM Tools, un producto desarrollado por IJMM System.",
  canonicalPath: "/privacy",
});

export default function PrivacyPage() {
  const breadcrumbs = [{ label: "Inicio", href: "/" }, { label: "Políticas de Privacidad" }];
  const currentYear = new Date().getFullYear();

  return (
    <Container size="md" className="py-8 sm:py-12 text-left">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl">
            Políticas de Privacidad
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Última actualización: {currentYear}</p>
        </div>

        <Card padding="lg" className="space-y-4 border-[var(--border)] text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            En <strong className="font-semibold text-[var(--text)]">IJMM Tools</strong> (un producto de <strong className="font-semibold text-[var(--text)]">IJMM System</strong>), valoramos y protegemos la privacidad de nuestros usuarios.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">1. Procesamiento Local de Datos</h2>
          <p>
            Nuestras herramientas de cálculo (como la Calculadora de Porcentajes) procesan los datos completamente en el navegador del usuario. Tus números e información calculada nunca se transmiten ni se almacenan en servidores externos.
          </p>
          <h2 className="text-base font-bold text-[var(--text)]">2. Información que Recopilamos</h2>
          <p>
            No requerimos registro de usuarios ni creación de cuentas personales. Los registros de acceso estándar de la infraestructura web (como la dirección IP y el tipo de navegador) se procesan únicamente por razones técnicas de seguridad y rendimiento de red.
          </p>
        </Card>
      </div>
    </Container>
  );
}
