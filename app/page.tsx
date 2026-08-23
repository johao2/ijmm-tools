import React from "react";
import Link from "next/link";
import Image from "next/image";
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
import Badge from "@/components/ui/Badge";
import ToolCard from "@/components/tools/ToolCard";
import ToolSearch from "@/components/tools/ToolSearch";
import JsonLd from "@/components/seo/JsonLd";
import { constructMetadata, BASE_URL } from "@/lib/seo/metadata";
import { getActiveTools, getAllCategories, getToolsByCategory } from "@/lib/tools/registry";

export const metadata = constructMetadata({
  title: "Herramientas online gratuitas para tus tareas diarias",
  description:
    "Calcula, convierte, genera y resuelve tareas rápidamente con herramientas gratuitas, rápidas y privadas en tu navegador. Desarrollado por IJMM System.",
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

  // WebSite Schema.org JSON-LD in Spanish
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "IJMM Tools",
    url: BASE_URL,
    description: "Plataforma de herramientas digitales gratuitas, calculadoras, conversores y utilidades para desarrolladores.",
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
            <Badge variant="primary" className="gap-2 px-3.5 py-1.5">
              <Image
                src="/Logo_IJMM_SYSTEM.png"
                alt="IJMM System"
                width={20}
                height={20}
                className="h-4 w-auto object-contain"
              />
              <span>Un producto de IJMM System</span>
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)] sm:text-5xl lg:text-6xl leading-tight">
              Herramientas online gratuitas <br className="hidden sm:inline" />
              <span className="text-[var(--primary)]">para tus tareas diarias</span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              Calcula, convierte, genera y resuelve tareas rápidamente con utilidades gratuitas y privadas que se ejecutan directamente en tu navegador.
            </p>
          </div>

          {/* Prominent Global Search Bar */}
          <div className="mx-auto max-w-xl">
            <ToolSearch placeholder="Buscar herramienta gratuita (ej. porcentaje, calculadoras)..." />
          </div>
        </Container>
      </section>

      {/* Popular / Active Tools Section */}
      <section className="py-12 sm:py-16">
        <Container size="lg" className="space-y-8">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--border)] pb-4 text-left">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
                Herramientas destacadas
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Explora nuestras calculadoras y utilidades digitales listas para usar en producción.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-xs sm:text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Ver todas las herramientas</span>
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
              Explora por categoría
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Encuentra utilidades especializadas organizadas por área de uso.
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
                        {activeCount} {activeCount === 1 ? "herramienta" : "herramientas"}
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
              ¿Por qué elegir IJMM Tools?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Diseñado bajo principios de ingeniería enfocados en velocidad, privacidad y facilidad de uso.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            <Card padding="md" variant="outline" className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-(--radius-sm) bg-blue-100 text-[var(--primary)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">100% Gratis</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Todas nuestras calculadoras y utilidades son gratuitas y sin cobros ocultos.
              </p>
            </Card>

            <Card padding="md" variant="outline" className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-(--radius-sm) bg-emerald-100 text-emerald-700">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Velocidad de Navegador</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Los cálculos se realizan de forma instantánea en tu navegador sin demoras de servidor.
              </p>
            </Card>

            <Card padding="md" variant="outline" className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-(--radius-sm) bg-purple-100 text-purple-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Privacidad Garantizada</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Tus datos permanecen locales. Tus números no se envían a servidores ni se almacenan.
              </p>
            </Card>

            <Card padding="md" variant="outline" className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-(--radius-sm) bg-amber-100 text-amber-700">
                <UserX className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Sin Registro</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Resuelve tus necesidades al instante sin crear cuentas ni ingresar contraseñas.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Final Call to Action */}
      <section className="bg-[var(--surface)] border-t border-[var(--border)] py-12">
        <Container size="md" className="text-center space-y-4">
          <h2 className="text-lg font-bold text-[var(--text)] sm:text-xl">
            ¿Buscas más herramientas?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Explora nuestro catálogo completo de utilidades activas y en desarrollo.
          </p>
          <div>
            <Link href="/tools">
              <Button variant="primary" size="md">
                <span>Explorar Todas las Herramientas</span>
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
