import { Category } from "@/lib/tools/types";

export const CATEGORIES: Category[] = [
  {
    id: "calculators",
    name: "Calculators",
    slug: "calculators",
    description: "Fast, accurate financial, percentage, and mathematical calculation tools.",
    icon: "Calculator",
    status: "active",
  },
  {
    id: "developer-tools",
    name: "Developer Tools",
    slug: "developer-tools",
    description: "Essential utilities for web developers, code formatting, and data validation.",
    icon: "Code",
    status: "active",
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    slug: "pdf-tools",
    description: "Browser-based PDF processing, merging, and compression tools.",
    icon: "FileText",
    status: "active",
  },
  {
    id: "image-tools",
    name: "Image Tools",
    slug: "image-tools",
    description: "Image compression, conversion, and editing utilities.",
    icon: "Image",
    status: "active",
  },
  {
    id: "generators",
    name: "Generators",
    slug: "generators",
    description: "Secure password, QR code, and data generator tools.",
    icon: "Sparkles",
    status: "active",
  },
  {
    id: "converters",
    name: "Converters",
    slug: "converters",
    description: "Unit, measurement, and format conversion utilities.",
    icon: "RefreshCw",
    status: "active",
  },
  {
    id: "security-tools",
    name: "Security Tools",
    slug: "security-tools",
    description: "Hashing, encryption, and digital security analysis tools.",
    icon: "Shield",
    status: "active",
  },
  {
    id: "ecuador-tools",
    name: "Ecuador Tools",
    slug: "ecuador-tools",
    description: "Herramientas digitales y calculadoras tributarias para Ecuador.",
    icon: "Globe",
    status: "active",
  },
];

export const CATEGORIES_BY_ID = new Map<string, Category>(
  CATEGORIES.map((cat) => [cat.id, cat])
);
