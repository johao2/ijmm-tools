import type { ElementType } from "react";
import {
  BarChart3,
  Binary,
  Calculator,
  Code,
  Divide,
  FileText,
  Files,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Key,
  Landmark,
  PenLine,
  Percent,
  QrCode,
  Quote,
  RefreshCw,
  ScanSearch,
  Shield,
  Sparkles,
  Terminal,
  Timer,
  Wrench,
} from "lucide-react";

/** Íconos disponibles por nombre (campo `icon` de herramientas y categorías). */
export const ICONS: Record<string, ElementType> = {
  BarChart3,
  Binary,
  Calculator,
  Code,
  Divide,
  FileText,
  Files,
  Globe,
  GraduationCap,
  Image: ImageIcon,
  Key,
  Landmark,
  PenLine,
  Percent,
  QrCode,
  Quote,
  RefreshCw,
  ScanSearch,
  Shield,
  Sparkles,
  Terminal,
  Timer,
};

export function getIcon(name: string): ElementType {
  return ICONS[name] ?? Wrench;
}
