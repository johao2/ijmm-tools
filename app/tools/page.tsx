import React from "react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import ToolsDirectoryClient from "@/components/tools/ToolsDirectoryClient";
import { constructMetadata } from "@/lib/seo/metadata";
import { getActiveTools, getAllCategories } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "All Tools — Directory",
  description:
    "Browse all free online tools, calculators, converters, and digital utilities available on IJMM Tools by IJMM System.",
  canonicalPath: "/tools",
  keywords: ["tools directory", "all online tools", "free calculators list", "utility directory"],
});

export default function ToolsDirectoryPage() {
  const activeTools = getActiveTools();
  const categories = getAllCategories();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Tools" },
  ];

  return (
    <Container size="lg" className="py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="mb-8 space-y-2 text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
          All Tools
        </h1>
        <p className="text-sm text-[var(--text-muted)] sm:text-base max-w-2xl leading-relaxed">
          Discover our full collection of free, privacy-focused online calculators and utilities.
          Filter by category or search by task.
        </p>
      </div>

      <ToolsDirectoryClient initialTools={activeTools} categories={categories} />
    </Container>
  );
}
