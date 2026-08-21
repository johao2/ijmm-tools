"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Wrench } from "lucide-react";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { searchTools } from "@/lib/tools/registry";
import { Tool } from "@/lib/tools/types";
import { cn } from "@/lib/utils/cn";

export interface ToolSearchProps {
  placeholder?: string;
  showResultsInline?: boolean;
  autoFocus?: boolean;
  className?: string;
  onSearchChange?: (query: string, results: Tool[]) => void;
}

export const ToolSearch: React.FC<ToolSearchProps> = ({
  placeholder = "Search tools (e.g., percentage, json, qr)...",
  showResultsInline = true,
  autoFocus = false,
  className,
  onSearchChange,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      if (onSearchChange) onSearchChange("", []);
      return;
    }

    // searchTools returns ONLY status === "active" tools by default
    const mathingTools = searchTools(trimmed, false);
    setResults(mathingTools);
    setIsOpen(true);

    if (onSearchChange) {
      onSearchChange(trimmed, mathingTools);
    }
  }, [query, onSearchChange]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-10 py-2.5 text-sm sm:text-base shadow-sm border-[var(--border)] focus:border-[var(--primary)]"
          aria-label="Search digital tools"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-[var(--text-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-xs cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Inline Floating Search Results Dropdown */}
      {showResultsInline && isOpen && query.trim() !== "" && (
        <Card
          padding="none"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto border-[var(--border)] bg-[var(--surface)] shadow-lg"
        >
          {results.length > 0 ? (
            <div className="divide-y divide-[var(--border)] p-2">
              {results.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/${tool.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between gap-3 p-3 rounded-(--radius-md) transition-colors hover:bg-[var(--surface-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <div className="flex items-center gap-3 text-left min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-sm) bg-[var(--primary-light)] text-[var(--primary)]">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[var(--text)] truncate">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {tool.shortDescription}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[var(--text-muted)] space-y-1">
              <p className="font-semibold text-[var(--text)]">No tools found matching &quot;{query}&quot;</p>
              <p>Try searching for percentages, calculators, or browse by category.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ToolSearch;
