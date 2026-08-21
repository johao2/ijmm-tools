import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import ToolCard from "@/components/tools/ToolCard";
import { constructMetadata } from "@/lib/seo/metadata";
import {
  getAllCategories,
  getCategoryBySlug,
  getToolsByCategory,
} from "@/lib/tools/registry";
import { ArrowLeft, Clock } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 1. Static Params Generation for Pre-rendering
export async function generateStaticParams() {
  return getAllCategories().map((cat) => ({
    slug: cat.slug,
  }));
}

// 2. Dynamic Metadata Generation
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return constructMetadata({
      title: "Category Not Found",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${category.name} — Tools & Calculators`,
    description: category.description,
    canonicalPath: `/categories/${category.slug}`,
    keywords: [category.name, `${category.name} tools`, `${category.name} calculators`],
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const activeTools = getToolsByCategory(category.id, false);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: category.name },
  ];

  return (
    <Container size="lg" className="py-8 sm:py-12">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="mb-8 space-y-2 text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
          {category.name}
        </h1>
        <p className="text-sm text-[var(--text-muted)] sm:text-base max-w-2xl leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Active Tools Grid / Informative Roadmap State */}
      {activeTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <Card padding="lg" className="text-center space-y-4 border-[var(--border)] max-w-2xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
            <Clock className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[var(--text)] sm:text-lg">
              Tools In Active Development
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
              Utilities for <strong className="font-semibold text-[var(--text)]">{category.name}</strong> are currently being engineered on our product roadmap. Check back soon for new releases!
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/categories">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                <span>All Categories</span>
              </Button>
            </Link>
            <Link href="/tools">
              <Button variant="primary" size="sm">
                <span>View Active Tools</span>
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </Container>
  );
}
