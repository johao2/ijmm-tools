import React from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)]">
      <Container size="lg" className="py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand Info & Logo */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-[var(--text)] tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
            >
              <Image
                src="/Logo_IJMM_SYSTEM.png"
                alt="Logo IJMM System"
                width={100}
                height={32}
                className="h-7 w-auto object-contain"
              />
              <span>IJMM <span className="text-[var(--primary)]">Tools</span></span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Un producto desarrollado por <strong className="font-semibold text-[var(--text)]">IJMM System</strong>.
              Herramientas digitales gratuitas, rápidas y orientadas a la utilidad directa.
            </p>
            <p className="text-xs font-medium text-[var(--text)]">A product by IJMM System</p>
          </div>

          {/* Column 2: Platform Directory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Plataforma
            </h3>
            <ul className="space-y-2 text-xs">
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
