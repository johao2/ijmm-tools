import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import Container from "@/components/ui/Container";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <Container size="lg" className="flex h-16 items-center justify-between gap-4">
        {/* Official Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 rounded-xs group"
        >
          <div className="relative flex h-9 w-auto items-center overflow-hidden">
            <Image
              src="/Logo_IJMM_SYSTEM.png"
              alt="Logo IJMM System — IJMM Tools"
              width={120}
              height={40}
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[var(--text)] hidden sm:inline-block">
            IJMM <span className="text-[var(--primary)]">Tools</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <Navigation className="hidden md:block" />

        {/* Header Search Slot & Mobile Toggle */}
        <div className="flex items-center gap-3">
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
