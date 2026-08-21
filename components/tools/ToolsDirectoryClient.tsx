"use client";

import React, { useState, useMemo } from "react";
import ToolCard from "@/components/tools/ToolCard";
import ToolSearch from "@/components/tools/ToolSearch";
import Button from "@/components/ui/Button";
import { Tool, Category } from "@/lib/tools/types";

export interface ToolsDirectoryClientProps {
  initialTools: Tool[];
  categories: Category[];
}

export const ToolsDirectoryClient: React.FC<ToolsDirectoryClientProps> = ({
  initialTools,
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTools = useMemo(() => {
    return initialTools.filter((tool) => {
      // 1. Category Filter
      if (selectedCategory !== "all" && tool.categoryId !== selectedCategory) {
        return false;
      }

      // 2. Text Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = tool.name.toLowerCase().includes(q);
        const descMatch = tool.shortDescription.toLowerCase().includes(q);
        const keywordMatch = tool.seo.keywords?.some((kw) => kw.toLowerCase().includes(q));
        return nameMatch || descMatch || keywordMatch;
      }

      return true;
    });
  }, [initialTools, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 text-left">
      {/* Real-time search bar */}
      <div className="mx-auto max-w-xl">
        <ToolSearch
          placeholder="Buscar herramienta por nombre, palabras clave o descripción..."
          showResultsInline={false}
          onSearchChange={(q) => setSearchQuery(q)}
        />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <Button
          type="button"
          variant={selectedCategory === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className="rounded-full text-xs"
        >
          Todas las categorías ({initialTools.length})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            type="button"
            variant={selectedCategory === cat.id ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="rounded-full text-xs"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Tools Grid / Empty State */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="rounded-(--radius-lg) border border-[var(--border)] bg-[var(--surface)] p-12 text-center space-y-3">
          <p className="text-base font-bold text-[var(--text)]">No se encontraron herramientas con esos criterios</p>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Intenta limpiar tu búsqueda o seleccionar otra categoría.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
          >
            Restablecer Filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default ToolsDirectoryClient;
