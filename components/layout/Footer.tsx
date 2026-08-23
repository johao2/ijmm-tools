import React from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { CORPORATE_SITE_URL } from "@/lib/config/site";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)]">
      <Container size="lg" className="py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand Info & Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <a
                href={CORPORATE_SITE_URL}
                aria-label="Ir al sitio principal de IJMM System"
                className="rounded-(--radius-sm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                <Image
                  src="/Logo_IJMM_SYSTEM.png"
                  alt="IJMM System"
                  width={48}
                  height={48}
                  className="h-11 w-11 object-contain"
                />
              </a>
              <Link
                href="/"
                className="rounded-xs text-lg font-bold tracking-tight text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                IJMM <span className="text-[var(--primary)]">Tools</span>
              </Link>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Un producto desarrollado por <strong className="font-semibold text-[var(--text)]">IJMM System</strong>.
              Herramientas digitales gratuitas, rápidas y orientadas a la utilidad directa.
            </p>
            <a
              href={CORPORATE_SITE_URL}
              className="inline-block text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              Volver al sitio principal de IJMM System
            </a>
          </div>

          {/* Column 2: Platform Directory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Plataforma
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={CORPORATE_SITE_URL}
                  className="font-medium text-[var(--primary)] transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Sitio principal de IJMM System
                </a>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Directorio de Herramientas
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Todas las Categorías
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Empresa
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Acerca de IJMM Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Legales
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/cookies"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Políticas de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Términos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-muted)]">
          <p>© {currentYear} IJMM System. Todos los derechos reservados.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
