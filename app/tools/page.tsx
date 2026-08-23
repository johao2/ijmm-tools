import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import ToolsDirectoryClient from "@/components/tools/ToolsDirectoryClient";
import { constructMetadata } from "@/lib/seo/metadata";
import { getActiveTools, getAllCategories } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "Directorio de Herramientas",
  description:
    "Explora todas las herramientas online gratuitas, calculadoras y utilidades digitales disponibles en IJMM Tools por IJMM System.",
  canonicalPath: "/tools",
  keywords: ["directorio de herramientas", "herramientas gratis", "calculadoras online", "utilidades digitales"],
});

export default function ToolsDirectoryPage() {
  const activeTools = getActiveTools();
  const categories = getAllCategories();

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Herramientas" },
  ];

  return (
    <Container size="lg" className="py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="mb-8 space-y-2 text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
          Todas las Herramientas
        </h1>
        <p className="text-sm text-[var(--text-muted)] sm:text-base max-w-2xl leading-relaxed">
          Descubre nuestra colección completa de calculadoras y utilidades online gratuitas y respetuosas con tu privacidad.
          Filtra por categoría o busca por tarea.
        </p>
      </div>

      <ToolsDirectoryClient initialTools={activeTools} categories={categories} />
    </Container>
  );
}
