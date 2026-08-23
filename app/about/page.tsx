import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Card from "@/components/ui/Card";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Acerca de Nosotros",
  description: "Conoce más sobre IJMM Tools, una plataforma de herramientas digitales desarrollada y mantenida por IJMM System.",
  canonicalPath: "/about",
});

export default function AboutPage() {
  const breadcrumbs = [{ label: "Inicio", href: "/" }, { label: "Acerca de" }];

  return (
    <Container size="md" className="py-8 sm:py-12 text-left">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Acerca de IJMM Tools
          </h1>
          <p className="text-sm text-[var(--text-muted)] sm:text-base leading-relaxed">
            Herramientas digitales gratuitas, rápidas y privadas diseñadas para la productividad diaria.
          </p>
        </div>

        <Card padding="lg" className="space-y-4 border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">Nuestra Misión</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            IJMM Tools es un proyecto de ingeniería propiedad de <strong className="font-semibold text-[var(--text)]">IJMM System</strong>.
            Nuestro objetivo es ofrecer una plataforma moderna de utilidades digitales que proporcione calculadoras, conversores y herramientas de desarrollo confiables
            que se ejecuten directamente en tu navegador sin demoras de servidor ni registros obligatorios.
          </p>

          <h2 className="text-lg font-bold text-[var(--text)] pt-2">Principios de Ingeniería</h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)]">
            <li><strong>Velocidad y Rendimiento:</strong> Computación local en navegador con tiempos de carga mínimos.</li>
            <li><strong>Privacidad de Datos:</strong> Tus datos permanecen 100% locales en tu navegador.</li>
            <li><strong>Accesibilidad y Simplicidad:</strong> Interfaz limpia, sin distracciones visuales y construida bajo estándares WCAG.</li>
          </ul>
        </Card>
      </div>
    </Container>
  );
}
