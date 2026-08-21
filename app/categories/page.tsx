import React from "react";
import Link from "next/link";
import {
  Calculator,
  Code,
  FileText,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Shield,
  Globe,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { constructMetadata } from "@/lib/seo/metadata";
import { getAllCategories, getToolsByCategory } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "Tool Categories",
  description:
    "Explore all digital tool categories on IJMM Tools, including calculators, developer tools, PDF tools, image utilities, and Ecuador regional tools.",
  canonicalPath: "/categories",
});

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  calculators: Calculator,
  "developer-tools": Code,
  "pdf-tools": FileText,
  "image-tools": ImageIcon,
  generators: Sparkles,
  converters: RefreshCw,
  "security-tools": Shield,
  "ecuador-tools": Globe,
};

export default function CategoriesOverviewPage() {
  const categories = getAllCategories();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories" },
  ];

  return (
    <Container size="lg" className="py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="mb-8 space-y-2 text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
          Tool Categories
        </h1>
        <p className="text-sm text-[var(--text-muted)] sm:text-base max-w-2xl leading-relaxed">
          Explore tools organized by domain. Choose a category to find specialized calculators and utilities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const IconComp = CATEGORY_ICON_MAP[cat.id] || Calculator;
          const activeCount = getToolsByCategory(cat.id).length;

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-(--radius-lg)"
            >
              <Card padding="md" hoverEffect className="flex h-full flex-col justify-between text-left space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-(--radius-md) bg-[var(--primary-light)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
                      <IconComp className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface-secondary)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                      {activeCount} {activeCount === 1 ? "active tool" : "active tools"}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      {cat.name}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] group-hover:text-[var(--primary-hover)] pt-2 border-t border-[var(--border)]">
                  <span>Explore category</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
