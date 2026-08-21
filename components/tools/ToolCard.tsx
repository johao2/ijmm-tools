import React from "react";
import Link from "next/link";
import {
  Percent,
  Calculator,
  Code,
  FileText,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Shield,
  Globe,
  Key,
  QrCode,
  Files,
  Terminal,
  ArrowRight,
  Wrench,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { Tool } from "@/lib/tools/types";
import { getCategoryById } from "@/lib/tools/registry";
import { cn } from "@/lib/utils/cn";

export interface ToolCardProps {
  tool: Tool;
  className?: string;
}

// Icon mapping helper
const ICON_MAP: Record<string, React.ElementType> = {
  Percent,
  Calculator,
  Code,
  FileText,
  Image: ImageIcon,
  Sparkles,
  RefreshCw,
  Shield,
  Globe,
  Key,
  QrCode,
  Files,
  Terminal,
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, className }) => {
  const IconComponent = ICON_MAP[tool.icon] || Wrench;
  const category = getCategoryById(tool.categoryId);

  return (
    <Link
      href={`/${tool.slug}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-(--radius-lg)"
    >
      <Card
        padding="md"
        hoverEffect
        className={cn(
          "flex h-full flex-col justify-between transition-all duration-200 group-hover:border-blue-300",
          className
        )}
      >
        <div className="space-y-3 text-left">
          {/* Header row: Icon & Category badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-(--radius-md) bg-[var(--primary-light)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
              <IconComponent className="h-5 w-5" aria-hidden="true" />
            </div>
            {category && (
              <span className="rounded-full bg-[var(--surface-secondary)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {category.name}
              </span>
            )}
          </div>

          {/* Tool Title & Description */}
          <div>
            <h3 className="text-base font-bold text-[var(--text)] transition-colors group-hover:text-[var(--primary)]">
              {tool.name}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
              {tool.shortDescription}
            </p>
          </div>
        </div>

        {/* Card CTA Footer */}
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--primary)] transition-colors group-hover:text-[var(--primary-hover)]">
          <span>Use Tool</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </Card>
    </Link>
  );
};

export default ToolCard;
