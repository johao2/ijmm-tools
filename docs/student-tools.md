# Herramientas para estudiantes universitarios

IJMM Tools se orienta a estudiantes universitarios. Todas las herramientas funcionan en el navegador, sin registro y sin enviar datos a servidores. Los cálculos son deterministas y están cubiertos por pruebas unitarias en `lib/tools/__tests__/`.

## Catálogo

| Herramienta | Ruta | Lógica | Categoría |
|---|---|---|---|
| Promedio ponderado y nota necesaria | `/calculadora-promedio-ponderado` | `lib/tools/grades.ts` | Notas y promedios |
| Generador de citas APA 7 | `/generador-citas-apa` | `lib/tools/citations.ts` | Escritura académica |
| Contador de palabras | `/contador-de-palabras` | `lib/tools/text-stats.ts` | Escritura académica |
| Detector de similitud entre documentos | `/detector-de-similitud` | `lib/tools/similarity.ts`, `lib/files/docx.ts` | Escritura académica |
| Estadística descriptiva | `/calculadora-estadistica` | `lib/tools/statistics.ts` | Estadística |
| Regla de tres | `/regla-de-tres` | `lib/tools/rule-of-three.ts` | Matemáticas |
| Interés y amortización | `/calculadora-interes-compuesto` | `lib/tools/finance.ts` | Finanzas |
| Conversor de bases numéricas | `/conversor-bases-numericas` | `lib/tools/number-base.ts` | Programación y sistemas |
| Temporizador Pomodoro | `/temporizador-pomodoro` | `lib/tools/pomodoro.ts` | Organización y estudio |
| VAN y TIR | `/calculadora-van-tir` | `lib/tools/investment.ts` | Finanzas |
| Calculadora de matrices | `/calculadora-matrices` | `lib/tools/matrix.ts`, `lib/tools/fraction.ts` | Matemáticas |
| Resolver ecuaciones | `/resolver-ecuaciones` | `lib/tools/equations.ts` | Matemáticas |
| Tablas de verdad | `/generador-tablas-de-verdad` | `lib/tools/truth-table.ts` | Matemáticas |
| Días hábiles (feriados de Ecuador) | `/calculadora-dias-habiles` | `lib/tools/business-days.ts` | Organización y estudio |

Las páginas usan la plantilla común `components/tools/ToolPage.tsx` (migas de pan, datos estructurados WebApplication y FAQPage, anuncios, preguntas frecuentes y herramientas relacionadas). Los íconos se resuelven con `components/tools/icons.ts`.

## Criterios de exactitud

- **Promedio ponderado:** redondeo a 2 decimales. La nota necesaria se redondea **hacia arriba** a 2 decimales para no quedar por debajo del objetivo.
- **APA 7 (versión en español):** hasta 20 autores; con 21 o más, 19 primeros, “…” y el último. “y” entre autores (opción “&”). “(s. f.)” sin fecha. DOI como `https://doi.org/`. Mayúscula tras dos puntos en el subtítulo. No se cambian otras mayúsculas del título.
- **Estadística:** varianza muestral (n − 1) y poblacional (n); cuartiles por interpolación lineal (equivalente a CUARTIL.INC de Excel); hasta 6 decimales.
- **Amortización:** método francés; la última cuota ajusta los centavos para dejar el saldo en 0.
- **Bases numéricas:** aritmética `BigInt`, sin pérdida de precisión.
- **Matrices y ecuaciones:** fracciones exactas con `BigInt` (`fraction.ts`); determinante por eliminación gaussiana, inversa/rango/RREF por Gauss-Jordan. Raíces cuadráticas en forma exacta a ± b√r (raíz simplificada) y decimal a 10 decimales. Sistemas clasificados por Rouché-Frobenius; hasta 8×8.
- **VAN/TIR:** VAN = Σ FCₜ/(1+i)ᵗ con t = 0…n (Excel: VNA(i;FC₁:FCₙ)+FC₀). TIR por malla + bisección (1e-12) entre −99 % y 10 000 %; devuelve todas las raíces; 4 decimales. Recuperación con interpolación lineal (indicado en la interfaz).
- **Tablas de verdad:** precedencia ¬ > ∧ > ∨/⊕ > → > ↔; → y ↔ asocian por la derecha; filas desde V V V; máx. 6 variables.
- **Días hábiles:** entre fechas incluye ambas (DIAS.LAB); sumar no cuenta la inicial (DIA.LAB). Feriados de Ecuador según art. 65 CT y reforma R. O. S. 906 (20-dic-2016), verificada con el texto oficial: martes→lunes; miércoles/jueves→viernes (excepto 1-ene, 25-dic, martes de carnaval); sábado→viernes; domingo→lunes; 2-3 de noviembre por la Disposición General Primera a)–e). Pruebas contra calendarios oficiales 2023, 2024 y 2025. Los decretos ejecutivos pueden cambiar el calendario: la interfaz permite quitar o agregar fechas.

## Detector de similitud

- Sección 1 (comparación entre documentos): compara solo los documentos cargados entre sí (2 a 10), 100 % en el navegador. La búsqueda en internet es la sección 2 (ver abajo). Ninguna equivale a Turnitin y la página lo indica.
- Coincidencia = secuencias de n palabras consecutivas idénticas (n = 4, 5 o 7), normalizando mayúsculas, tildes y puntuación.
- Porcentaje por documento = palabras dentro de alguna coincidencia ÷ palabras del documento (1 decimal). Siempre se muestra junto al conteo exacto, el número de fragmentos y el fragmento más largo.
- No aplica umbrales propios: no existe un porcentaje reglamentario universal. Si el usuario ingresa el límite de su institución, las recomendaciones lo comparan contra ese valor.
- Las recomendaciones (`recommendations()`) se generan solo a partir de los datos medidos y de las reglas de citación APA 7.
- **Exclusiones (`lib/tools/similarity-filters.ts`):** texto entre comillas (“ ”, « », " " dentro de un párrafo), bibliografía (desde el último título “Referencias/Bibliografía…” en su propia línea hasta el final o “Anexos/Apéndices”) y coincidencias de menos de N palabras por fuente. Se aplican en el navegador sin repetir el análisis; el denominador no cambia y siempre se muestran el total y el ajustado con los conteos excluidos por motivo.
- **Colores por fuente:** cada palabra coincidente se atribuye a la fuente con más palabras coincidentes que la contiene; se resalta con su color y número y al pulsarla se va a la fuente.
- **Informe PDF (`SimilarityReport.tsx`):** portal en `<body>` visible solo en `@media print` (`app/globals.css`); se usa “Guardar como PDF” del navegador, sin dependencias. Incluye huella SHA-256 del archivo original (si el texto no se editó) o del texto analizado, exclusiones aplicadas, fuentes, texto coloreado y método.
- Lee `.docx` sin dependencias (ZIP + `DecompressionStream`), `.txt` y `.pdf`. El PDF usa `pdfjs-dist` (única dependencia añadida: el navegador no ofrece extracción de texto de PDF y un lector propio fallaría con fuentes CID/ToUnicode). Se carga con `import()` solo al elegir un PDF; el worker (~1,3 MB) se copia a `public/` en `predev`/`prebuild` y no entra en el bundle inicial. `lib/files/pdf-text.ts` (probado) une líneas, repara guiones de fin de línea y detecta PDF escaneados sin texto.

## Búsqueda de coincidencias en internet y repositorios

Segunda sección del detector (`components/tools/similarity/SourceSearch.tsx`) respaldada por `POST /api/source-check`.

- **Excepción de privacidad aprobada por el propietario:** el texto sale del navegador solo con consentimiento explícito (casilla obligatoria). No se guarda ni se registra; los buscadores reciben solo las frases consultadas. La política de privacidad lo indica.
- **Flujo (`lib/source-search/check.ts`):** selección de hasta 20 frases distintivas de 9 palabras (`selectQueryPhrases`) → búsqueda por frase exacta en cada servicio configurado → descarga del texto de páginas web candidatas (máx. 12, protegido contra redes internas, 2 MB, 10 s, 3 redirecciones) → comparación exacta con `matchAgainstSource` (mismo método de n-gramas) → porcentaje global y por fuente con conteo exacto y enlace directo.
- **Nivel de análisis por fuente:** texto completo (páginas web y CORE con fullText), solo resumen (OpenAlex) o solo extracto del buscador; la interfaz lo indica. Las fuentes sugeridas sin coincidencia verificable se listan aparte y no suman al porcentaje.
- **Servicios (`lib/source-search/providers.ts`, solo servidor):** Brave Search (`BRAVE_SEARCH_API_KEY`), CORE v3 (`CORE_API_KEY`), OpenAlex (`OPENALEX_API_KEY`). Sin ninguna clave la sección muestra “Próximamente”. Los fallos de un servicio se informan al usuario.
- **Límites:** 50 a 15 000 palabras; `SOURCE_CHECK_DAILY_LIMIT` revisiones por IP y día (contador en memoria por instancia: protección básica, no facturación); `maxDuration = 60`.
- **Probado con claves reales:** CORE rechaza frases entre comillas (HTTP 500), por eso se consulta sin comillas y la coincidencia exacta la verifica `matchAgainstSource`. Frases por servicio: Brave 20, CORE 8, OpenAlex 6, cada servicio en su propia cola (5, 4 y 3 consultas simultáneas). CORE y OpenAlex fallan de forma intermitente (lentitud, 5xx): cada consulta se reintenta una vez ante 429, 5xx, tiempo agotado o error de red; si aun así falla, se informa como aviso con el conteo "X de N".

## Pendiente

- Asistente de redacción académica con IA (función de pago; requiere servidor y aviso de privacidad).
- Detección de paráfrasis con IA como indicador “posible paráfrasis”, fuera del porcentaje exacto.
