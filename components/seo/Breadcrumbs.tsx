import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import JsonLd from "./JsonLd";
import { BASE_URL } from "@/lib/seo/metadata";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  // 1. Build Schema.org BreadcrumbList structured data
  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${BASE_URL}${item.href}` : `${BASE_URL}`,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbListSchema} />

      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex items-center space-x-2 text-xs text-[var(--text-muted)] flex-wrap">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="flex items-center space-x-2">
                {idx > 0 && (
                  <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="font-semibold text-[var(--text)]"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
