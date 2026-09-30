// Copia el worker de pdf.js a /public para servirlo desde el mismo dominio (misma versión que la librería instalada).
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
copyFileSync("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "public/pdf.worker.min.mjs");
