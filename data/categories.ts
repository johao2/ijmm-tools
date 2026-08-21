import { Category } from "@/lib/tools/types";

export const CATEGORIES: Category[] = [
  {
    id: "calculators",
    name: "Calculadoras",
    slug: "calculators",
    description: "Calculadoras financieras, porcentajes y utilidades matemáticas rápidas y precisas.",
    icon: "Calculator",
    status: "active",
  },
  {
    id: "developer-tools",
    name: "Herramientas para desarrolladores",
    slug: "developer-tools",
    description: "Utilidades esenciales para desarrollo web, formateo de código y validación de datos.",
    icon: "Code",
    status: "active",
  },
  {
    id: "pdf-tools",
    name: "Herramientas PDF",
    slug: "pdf-tools",
    description: "Procesamiento, combinación y compresión de archivos PDF directamente en tu navegador.",
    icon: "FileText",
    status: "active",
  },
  {
    id: "image-tools",
    name: "Herramientas de imagen",
    slug: "image-tools",
    description: "Compresión, conversión y edición de imágenes sin perder calidad.",
    icon: "Image",
    status: "active",
  },
  {
    id: "generators",
    name: "Generadores",
    slug: "generators",
    description: "Generadores de contraseñas seguras, códigos QR y datos de prueba.",
    icon: "Sparkles",
    status: "active",
  },
  {
    id: "converters",
    name: "Conversores",
    slug: "converters",
    description: "Conversión rápida de unidades de medida, formatos y magnitudes.",
    icon: "RefreshCw",
    status: "active",
  },
  {
    id: "security-tools",
    name: "Herramientas de seguridad",
    slug: "security-tools",
    description: "Análisis de seguridad digital, verificación de hashes y cifrado de datos.",
    icon: "Shield",
    status: "active",
  },
  {
    id: "ecuador-tools",
    name: "Herramientas para Ecuador",
    slug: "ecuador-tools",
    description: "Herramientas digitales, cálculo de IVA y utilidades tributarias para Ecuador.",
    icon: "Globe",
    status: "active",
  },
];

export const CATEGORIES_BY_ID = new Map<string, Category>(
  CATEGORIES.map((cat) => [cat.id, cat])
);
