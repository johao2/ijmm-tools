/**
 * Compilación para Cloudflare Workers sin filtrar secretos.
 * OpenNext copia al Worker el contenido de los archivos .env que encuentre; por eso, durante la compilación,
 * se esconden los archivos locales (.env.local, .env.*.local, .env.development) y solo queda .env.production
 * (valores públicos). Al terminar se restauran y se revisa que el paquete no contenga llaves privadas.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync, statSync } from "node:fs";
import { join } from "node:path";

const HIDE = [".env", ".env.local", ".env.development", ".env.development.local", ".env.production.local", ".env.test", ".env.test.local"];
const FORBIDDEN = [/BEGIN [A-Z ]*PRIVATE KEY/, /"(OPENALEX_API_KEY|CORE_API_KEY|BRAVE_SEARCH_API_KEY)":"[^"]+"/];

const hidden = [];
try {
  for (const file of HIDE) {
    if (existsSync(file)) {
      renameSync(file, `${file}.cf-oculto`);
      hidden.push(file);
    }
  }
  execSync("npx opennextjs-cloudflare build", { stdio: "inherit" });
} finally {
  for (const file of hidden) renameSync(`${file}.cf-oculto`, file);
}

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(m?js|json|html|txt)$/.test(name)) yield path;
  }
}
for (const file of files(".open-next")) {
  const text = readFileSync(file, "utf8");
  const hit = FORBIDDEN.find((pattern) => pattern.test(text));
  if (hit) {
    console.error(`\n✖ Se encontró un secreto en ${file} (${hit}). No se publica.`);
    process.exit(1);
  }
}
console.log("\n✔ Paquete listo y sin secretos.");
