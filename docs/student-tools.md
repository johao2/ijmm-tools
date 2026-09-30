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

Las páginas usan la plantilla común `components/tools/ToolPage.tsx` (migas de pan, datos estructurados WebApplication y FAQPage, anuncios, preguntas frecuentes y herramientas relacionadas). Los íconos se resuelven con `components/tools/icons.ts`.

## Criterios de exactitud

- **Promedio ponderado:** redondeo a 2 decimales. La nota necesaria se redondea **hacia arriba** a 2 decimales para no quedar por debajo del objetivo.
- **APA 7 (versión en español):** hasta 20 autores; con 21 o más, 19 primeros, “…” y el último. “y” entre autores (opción “&”). “(s. f.)” sin fecha. DOI como `https://doi.org/`. Mayúscula tras dos puntos en el subtítulo. No se cambian otras mayúsculas del título.
- **Estadística:** varianza muestral (n − 1) y poblacional (n); cuartiles por interpolación lineal (equivalente a CUARTIL.INC de Excel); hasta 6 decimales.
- **Amortización:** método francés; la última cuota ajusta los centavos para dejar el saldo en 0.
- **Bases numéricas:** aritmética `BigInt`, sin pérdida de precisión.

## Detector de similitud

- Compara solo los documentos cargados entre sí (2 a 10). No consulta internet ni bases académicas; no equivale a Turnitin y la página lo indica.
- Coincidencia = secuencias de n palabras consecutivas idénticas (n = 4, 5 o 7), normalizando mayúsculas, tildes y puntuación.
- Porcentaje por documento = palabras dentro de alguna coincidencia ÷ palabras del documento (1 decimal). Siempre se muestra junto al conteo exacto, el número de fragmentos y el fragmento más largo.
- No aplica umbrales propios: no existe un porcentaje reglamentario universal. Si el usuario ingresa el límite de su institución, las recomendaciones lo comparan contra ese valor.
- Las recomendaciones (`recommendations()`) se generan solo a partir de los datos medidos y de las reglas de citación APA 7.
- Lee `.docx` sin dependencias (ZIP + `DecompressionStream`) y `.txt`. Los PDF se deben pegar como texto.

## Búsqueda de coincidencias en internet y repositorios

Segunda sección del detector (`components/tools/similarity/SourceSearch.tsx`) respaldada por `POST /api/source-check`.

- **Excepción de privacidad aprobada por el propietario:** el texto sale del navegador solo con consentimiento explícito (casilla obligatoria). No se guarda ni se registra; los buscadores reciben solo las frases consultadas. La política de privacidad lo indica.
- **Flujo (`lib/source-search/check.ts`):** selección de hasta 20 frases distintivas de 9 palabras (`selectQueryPhrases`) → búsqueda por frase exacta en cada servicio configurado → descarga del texto de páginas web candidatas (máx. 12, protegido contra redes internas, 2 MB, 10 s, 3 redirecciones) → comparación exacta con `matchAgainstSource` (mismo método de n-gramas) → porcentaje global y por fuente con conteo exacto y enlace directo.
- **Nivel de análisis por fuente:** texto completo (páginas web y CORE con fullText), solo resumen (OpenAlex) o solo extracto del buscador; la interfaz lo indica. Las fuentes sugeridas sin coincidencia verificable se listan aparte y no suman al porcentaje.
- **Servicios (`lib/source-search/providers.ts`, solo servidor):** Brave Search (`BRAVE_SEARCH_API_KEY`), CORE v3 (`CORE_API_KEY`), OpenAlex (`OPENALEX_API_KEY`). Sin ninguna clave la sección muestra “Próximamente”. Los fallos de un servicio se informan al usuario.
- **Límites:** 50 a 15 000 palabras; `SOURCE_CHECK_DAILY_LIMIT` revisiones por IP y día (contador en memoria por instancia: protección básica, no facturación); `maxDuration = 60`.
- **Pendiente de verificar con claves reales:** nombres de campos de CORE v3 (`fullText`, `links`, `downloadUrl`, `doi`); el conector es defensivo, pero debe probarse en vivo.

## Pendiente

- Asistente de redacción académica con IA (función de pago; requiere servidor y aviso de privacidad).
- Detección de paráfrasis con IA como indicador “posible paráfrasis”, fuera del porcentaje exacto.
- Fase 2: ecuaciones, matrices, tablas de verdad, VAN/TIR, días hábiles.
