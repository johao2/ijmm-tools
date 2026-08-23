import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Search } from "lucide-react";
import Container from "@/components/ui/Container";
import { CORPORATE_SITE_URL } from "@/lib/config/site";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <Container size="lg" className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={CORPORATE_SITE_URL}
            aria-label="Ir al sitio principal de IJMM System"
            title="Ir a IJMM System"
            className="group flex rounded-(--radius-sm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
          >
            <Image
              src="/Logo_IJMM_SYSTEM.png"
              alt="IJMM System"
              width={48}
              height={48}
              className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
              priority
            />
          </a>
          <Link
            href="/"
            aria-label="Inicio de IJMM Tools"
            className="rounded-xs text-lg font-extrabold tracking-tight text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
          >
            IJMM <span className="text-[var(--primary)]">Tools</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <Navigation className="hidden md:block" />

        {/* Header Search Slot & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href={CORPORATE_SITE_URL}
            className="hidden items-center gap-1 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:flex"
          >
            <span>Sitio principal</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          {/* Header Search Trigger */}
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Link
              href="/tools"
              className="flex w-full items-center gap-2 rounded-(--radius-md) border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Buscar herramientas...</span>
            </Link>
          </div>

          {/* Mobile Search Icon Trigger */}
          <Link
            href="/tools"
            className="sm:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-(--radius-md)"
            aria-label="Buscar herramientas"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Mobile Menu Drawer Toggle */}
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
};

export default Header;
