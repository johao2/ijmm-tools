"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./Navigation";

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="md:hidden">
      {/* Menu Toggle Button */}
      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Cerrar menú principal" : "Abrir menú principal"}
        className="inline-flex items-center justify-center rounded-(--radius-md) p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 transition-colors cursor-pointer"
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
      </button>

      {/* Drawer Overlay & Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/50 backdrop-blur-xs">
          {/* Backdrop click area */}
          <div className="fixed inset-0" onClick={closeMenu} aria-hidden="true" />

          {/* Drawer Menu Panel */}
          <div
            id="mobile-menu"
            className="relative z-10 ml-auto flex h-full w-full max-w-xs flex-col bg-[var(--surface)] p-6 shadow-xl"
          >
            {/* Header section in drawer */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-2 text-base font-bold text-[var(--text)] tracking-tight"
              >
                <Image
                  src="/Logo_IJMM_SYSTEM.png"
                  alt="IJMM System"
                  width={90}
                  height={30}
                  className="h-6 w-auto object-contain"
                />
                <span>IJMM <span className="text-[var(--primary)]">Tools</span></span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Cerrar menú"
                className="rounded-(--radius-md) p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="mt-6 flex-1" aria-label="Navegación móvil">
              <ul className="space-y-4 text-base font-medium">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="block rounded-(--radius-md) px-3 py-2 text-[var(--text)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer inside drawer */}
            <div className="border-t border-[var(--border)] pt-4 text-xs text-[var(--text-muted)]">
              <p>© {currentYear} IJMM System. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
