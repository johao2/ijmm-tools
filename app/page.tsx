import React from "react";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  UserX,
  Sparkles,
  ArrowRight,
  Calculator,
  Code,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Shield,
  Globe,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ToolCard from "@/components/tools/ToolCard";
import ToolSearch from "@/components/tools/ToolSearch";
import JsonLd from "@/components/seo/JsonLd";
import { constructMetadata, BASE_URL } from "@/lib/seo/metadata";
import { getActiveTools, getAllCategories, getToolsByCategory } from "@/lib/tools/registry";

// 1. Next.js Metadata API
export const metadata = constructMetadata({
  title: "Free Online Tools for Everyday Tasks",
  description:
    "Fast, simple, and privacy-friendly online tools that work directly in your browser. Free calculators, converters, and developer utilities by IJMM System.",
  canonicalPath: "/",
});

// Category Icon Mapping
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

export default function HomePage() {
  const activeTools = getActiveTools();
  const categories = getAllCategories();

  // WebSite Schema.org JSON-LD
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "IJMM Tools",
    url: BASE_URL,
    description: "Free online digital tools, calculators, converters, and developer utilities.",
    publisher: {
      "@type": "Organization",
      name: "IJMM System",
      url: BASE_URL,
    },
  };

  return (
    <>
      <JsonLd data={webSiteSchema} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[var(--surface)] to-[var(--background)] py-12 sm:py-20 border-b border-[var(--border)]">
        <Container size="md" className="space-y-8 text-center">
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)] border border-blue-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>A product by IJMM System</span>
            </span>

            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl leading-tight">
              Free Online Tools for <br className="hidden sm:inline" />
              <span className="text-[var(--primary)]">Everyday Tasks</span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              Fast, simple, and privacy-friendly digital utilities that process directly in your browser.
              No installation or registration required.
            </p>
          </div>

          {/* Prominent Global Search Bar */}
          <div className="mx-auto max-w-xl">
            <ToolSearch placeholder="Search free online tools (e.g. percentage, calculators)..." />
          </div>
        </Container>
      </section>

      {/* Popular / Active Tools Section */}
      <section className="py-12 sm:py-16">
        <Container size="lg" className="space-y-8">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--border)] pb-4 text-left">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
                Featured Tools
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Explore our popular, production-ready digital calculators and utilities.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-xs sm:text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View all tools</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Active Tools Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </Container>
      </section>

      {/* Categories Overview Section */}
      <section className="bg-[var(--surface)] py-12 sm:py-16 border-y border-[var(--border)]">
        <Container size="lg" className="space-y-8">
          <div className="text-left space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
              Browse by Category
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Find specialized utilities organized by domain and task type.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const IconComp = CATEGORY_ICON_MAP[cat.id] || Calculator;
              const activeCount = getToolsByCategory(cat.id).length;

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-(--radius-lg)"
                >
                  <Card padding="md" hoverEffect className="h-full space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-(--radius-md) bg-[var(--surface-secondary)] text-[var(--text)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
                        <IconComp className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--background)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                        {activeCount} {activeCount === 1 ? "tool" : "tools"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* "Why IJMM Tools?" Value Proposition */}
      <section className="py-12 sm:py-16">
        <Container size="lg" className="space-y-8 text-center">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
              Why IJMM Tools?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Built on core software engineering principles prioritizing user experience and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <Card padding="md" variant="outline" className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-(--radius-sm) bg-blue-100 text-[var(--primary)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">100% Free to Use</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                All essential calculation and formatting utilities are free with zero hidden paywalls.
              </p>
            </Card>

            <Card padding="md" variant="outline" className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-(--radius-sm) bg-emerald-100 text-emerald-700">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Browser Speed</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Tools execute client-side in your browser for instant results without server delay.
              </p>
            </Card>

            <Card padding="md" variant="outline" className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-(--radius-sm) bg-purple-100 text-purple-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Privacy Focused</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Your data stays local in your browser. Calculations do not upload private numbers.
              </p>
            </Card>

            <Card padding="md" variant="outline" className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-(--radius-sm) bg-amber-100 text-amber-700">
                <UserX className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">No Registration</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Get things done immediately without signing up for accounts or remembering passwords.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Final Call to Action */}
      <section className="bg-[var(--surface)] border-t border-[var(--border)] py-12">
        <Container size="md" className="text-center space-y-4">
          <h2 className="text-lg font-bold text-[var(--text)] sm:text-xl">
            Need more tools?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Browse our full catalog of active tools and upcoming roadmap utilities.
          </p>
          <div>
            <Link href="/tools">
              <Button variant="primary" size="md">
                <span>Explore All Tools</span>
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
