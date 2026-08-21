import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ToolLayoutProps {
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  title,
  description,
  breadcrumbs,
  children,
}) => {
  return (
    <Container size="md" className="py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs text-[var(--text-muted)] flex-wrap">
            <li>
              <Link
                href="/"
                className="hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
              >
                Home
              </Link>
            </li>
            {breadcrumbs.map((item, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[var(--text)]" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Tool Header Section */}
      <div className="mb-8 space-y-2 text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-[var(--text-muted)] sm:text-base max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>

      {/* Main Tool Content Workspace */}
      <div className="w-full">{children}</div>
    </Container>
  );
};

export default ToolLayout;
