import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Container from "@/components/ui/Container";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <Container size="lg" className="flex h-16 items-center justify-between gap-4">
        {/* Brand Text Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 rounded-xs"
        >
          IJMM <span className="text-[var(--primary)]">Tools</span>
        </Link>

        {/* Desktop Navigation */}
        <Navigation className="hidden md:block" />

        {/* Header Search Architecture Slot & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Header Search Trigger / Container Placeholder (prepared for future ToolSearch) */}
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Link
              href="/tools"
              className="flex w-full items-center gap-2 rounded-(--radius-md) border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Search tools...</span>
            </Link>
          </div>

          {/* Mobile Search Icon Trigger */}
          <Link
            href="/tools"
            className="sm:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-(--radius-md)"
            aria-label="Search tools"
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
