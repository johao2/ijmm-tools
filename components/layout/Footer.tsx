import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)]">
      <Container size="lg" className="py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <Link
              href="/"
              className="text-lg font-bold text-[var(--text)] tracking-tight inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
            >
              IJMM <span className="text-[var(--primary)]">Tools</span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              A product by <strong className="font-semibold text-[var(--text)]">IJMM System</strong>.
              Free, fast, and utility-first digital tools for everyday tasks.
            </p>
          </div>

          {/* Column 2: Tools Directory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/tools"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Tools Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Company
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  About IJMM Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-muted)]">
          <p>© 2026 IJMM System. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
