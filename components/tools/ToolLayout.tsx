import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ToolShell from "./ToolShell";
import ToolHeader from "./ToolHeader";
import ToolContent from "./ToolContent";

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
    <ToolShell>
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
      <ToolHeader title={title} description={description} />

      {/* Main Tool Content Workspace */}
      <ToolContent>{children}</ToolContent>
    </ToolShell>
  );
};

export default ToolLayout;
