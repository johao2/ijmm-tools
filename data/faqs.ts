import { FAQItem } from "@/lib/tools/types";

export const FAQS_BY_TOOL_ID: Record<string, FAQItem[]> = {
  "calculadora-promedio-ponderado": [
    {
      question: "¿Qué es un promedio ponderado?",
      answer: "Es un promedio en el que cada nota pesa distinto según su porcentaje. Se multiplica cada nota por su peso, se suman los resultados y se divide entre la suma de los pesos.",
      formula: "Promedio = Σ (nota × peso) ÷ Σ pesos",
      example: "Deberes 8 (30%), parcial 6 (30%) y final 9 (40%): (8×30 + 6×30 + 9×40) ÷ 100 = 7.8",
    },
    {
      question: "¿Cómo sé qué nota necesito en el examen final?",
      answer: "Resta a la nota que quieres obtener los puntos que ya acumulaste y divide lo que falta entre el peso del examen final.",
      formula: "Nota necesaria = (Objetivo − puntos acumulados) ÷ peso del final",
      example: "Si ya tienes 3.6 puntos del 60% evaluado y el final vale 40%, para llegar a 7 necesitas (7 − 3.6) ÷ 0.40 = 8.5",
    },
    {
      question: "¿Qué pasa si los porcentajes no suman 100%?",
      answer: "La calculadora muestra tu promedio parcial sobre lo evaluado hasta ahora. Los pesos nunca pueden superar el 100%.",
    },
    {
      question: "¿Sirve para notas sobre 10, 20 o 100?",
      answer: "Sí. Elige la escala de tu universidad y todas las notas se validan dentro de ese rango.",
    },
  ],
  "generador-citas-apa": [
    {
      question: "¿Qué cambió en APA 7 respecto a APA 6?",
      answer: "APA 7 incluye hasta 20 autores en la referencia, ya no pide el lugar de publicación de los libros, presenta el DOI como enlace https://doi.org/ y usa “et al.” desde tres autores en la cita dentro del texto.",
    },
    {
      question: "¿Se usa “y” o “&” entre autores?",
      answer: "En la versión en español de APA 7 se usa “y”. Algunas universidades piden “&”; puedes activar esa opción en el generador.",
    },
    {
      question: "¿Qué pongo si la fuente no tiene fecha?",
      answer: "Deja el año vacío y la referencia mostrará “(s. f.)”, que significa sin fecha.",
    },
    {
      question: "¿El generador pone el título en minúsculas?",
      answer: "No lo cambia automáticamente. En APA 7 los títulos de libros y artículos van en tipo oración: solo la primera palabra y los nombres propios con mayúscula. Escríbelo así antes de generar.",
    },
  ],
  "contador-de-palabras": [
    {
      question: "¿Cómo se calcula el tiempo de lectura?",
      answer: "Se estima con una velocidad promedio de 200 palabras por minuto para lectura silenciosa y 130 palabras por minuto para exponer en voz alta.",
      formula: "Minutos = palabras ÷ 200",
    },
    {
      question: "¿Cuántas páginas ocupa mi texto?",
      answer: "Es una aproximación: unas 275 palabras por página a doble espacio (formato APA, letra de 12 puntos) y unas 550 a espacio simple. El número real depende de la fuente, los márgenes y los títulos.",
    },
    {
      question: "¿Mi texto se guarda en algún servidor?",
      answer: "No. El conteo se hace en tu navegador y el texto no se envía a IJMM System.",
    },
  ],
  "detector-de-similitud": [
    {
      question: "¿Cómo funciona el detector de similitud?",
      answer: "Divide cada documento en secuencias de palabras consecutivas (por defecto 5) y busca las que se repiten en los otros documentos. Ignora mayúsculas, tildes y signos de puntuación, y resalta los fragmentos coincidentes.",
    },
    {
      question: "¿Es lo mismo que Turnitin?",
      answer: "No. Puedes comparar tus documentos entre sí y buscar coincidencias en internet y en repositorios académicos de acceso abierto, con enlace a cada fuente. No tenemos acceso a la base privada de Turnitin (trabajos entregados por estudiantes) ni a revistas de pago, por lo que los resultados pueden diferir.",
    },
    {
      question: "¿Qué formatos acepta?",
      answer: "Archivos .docx (Word), .pdf y .txt, o texto pegado directamente. Los archivos se leen en tu navegador. Un PDF escaneado como imagen no tiene texto que leer: primero hay que pasarlo por OCR.",
    },
    {
      question: "¿Mis documentos se suben a internet?",
      answer: "La comparación entre documentos se hace completamente en tu navegador. La búsqueda en internet solo se realiza si aceptas enviar el texto: se procesa en nuestros servidores para consultar frases en los buscadores y no se guarda.",
    },
    {
      question: "¿Qué porcentaje de similitud es aceptable?",
      answer: "Depende de cada universidad y docente. Una coincidencia alta no siempre es plagio: las citas textuales bien referenciadas y las frases técnicas comunes también coinciden. Revisa cada fragmento resaltado.",
    },
  ],
  "calculadora-estadistica": [
    {
      question: "¿Cuál es la diferencia entre desviación estándar muestral y poblacional?",
      answer: "La poblacional divide la suma de cuadrados entre n y se usa cuando tienes todos los datos de la población. La muestral divide entre n − 1 y se usa cuando los datos son una muestra; es la más común en investigación.",
      formula: "s = √( Σ (x − x̄)² ÷ (n − 1) )",
    },
    {
      question: "¿Cómo se calculan los cuartiles?",
      answer: "Con interpolación lineal, el mismo método que usa la función CUARTIL.INC de Excel. Por eso los resultados coinciden con los de Excel.",
    },
    {
      question: "¿Qué pasa si ningún valor se repite?",
      answer: "No hay moda. Si varios valores se repiten el mismo número máximo de veces, la distribución es multimodal y se muestran todas las modas.",
    },
    {
      question: "¿Cómo ingreso los datos?",
      answer: "Pégalos separados por saltos de línea, espacios, punto y coma o comas. Puedes copiarlos directamente desde una columna de Excel.",
    },
  ],
  "regla-de-tres": [
    {
      question: "¿Cuándo uso la regla de tres directa?",
      answer: "Cuando las dos magnitudes aumentan o disminuyen juntas: más cuadernos, más dinero.",
      formula: "x = (B × C) ÷ A",
      example: "Si 3 cuadernos cuestan $6, 5 cuadernos cuestan (6 × 5) ÷ 3 = $10",
    },
    {
      question: "¿Cuándo uso la regla de tres inversa?",
      answer: "Cuando una magnitud aumenta y la otra disminuye: más obreros, menos días de trabajo.",
      formula: "x = (A × B) ÷ C",
      example: "Si 4 obreros tardan 6 días, 8 obreros tardan (4 × 6) ÷ 8 = 3 días",
    },
  ],
  "calculadora-interes-compuesto": [
    {
      question: "¿Cuál es la diferencia entre interés simple y compuesto?",
      answer: "En el interés simple los intereses se calculan siempre sobre el capital inicial. En el compuesto los intereses se suman al capital en cada periodo y generan nuevos intereses.",
      formula: "Simple: I = C × r × t · Compuesto: M = C × (1 + r/n)^(n × t)",
    },
    {
      question: "¿Qué es la tasa efectiva anual?",
      answer: "Es la tasa que realmente se gana o se paga en un año cuando los intereses se capitalizan varias veces. Una tasa nominal del 12% capitalizable mensualmente equivale a una tasa efectiva de 12.68%.",
    },
    {
      question: "¿Qué es el método francés de amortización?",
      answer: "Es el sistema de cuota fija que usan la mayoría de bancos: todas las cuotas son iguales; al principio se paga más interés y al final más capital.",
      formula: "Cuota = C × i ÷ (1 − (1 + i)^−n)",
    },
  ],
  "conversor-bases-numericas": [
    {
      question: "¿Cómo se convierte de decimal a binario?",
      answer: "Divide el número entre 2 sucesivamente y anota los residuos. El binario es la lista de residuos leída de abajo hacia arriba.",
      example: "13 → 13÷2=6 r1, 6÷2=3 r0, 3÷2=1 r1, 1÷2=0 r1 → 1101",
    },
    {
      question: "¿Puedo escribir prefijos como 0x o 0b?",
      answer: "Sí. El conversor acepta 0b para binario, 0o para octal y 0x para hexadecimal, además de espacios o guiones bajos para separar dígitos.",
    },
    {
      question: "¿Convierte números con decimales?",
      answer: "No; convierte números enteros, positivos o negativos, de cualquier tamaño y sin perder precisión.",
    },
  ],
  "temporizador-pomodoro": [
    {
      question: "¿Qué es la técnica Pomodoro?",
      answer: "Es un método de estudio que alterna bloques de concentración (normalmente 25 minutos) con descansos cortos de 5 minutos. Cada 4 bloques se toma un descanso más largo de 15 a 30 minutos.",
    },
    {
      question: "¿Puedo cambiar los tiempos?",
      answer: "Sí. Puedes configurar la duración del enfoque, de los descansos y cuántos bloques hay antes del descanso largo.",
    },
    {
      question: "¿Sigue funcionando si cambio de pestaña?",
      answer: "Sí. El tiempo se calcula con el reloj del sistema, así que el conteo sigue siendo exacto aunque cambies de pestaña. Mantén la página abierta para escuchar el aviso.",
    },
  ],
  "percentage-calculator": [
    {
      question: "¿Qué es un porcentaje?",
      answer: "Un porcentaje es una forma de expresar un número como una fracción de 100. Se representa con el símbolo de porcentaje (%). Por ejemplo, el 45% significa 45 partes de 100.",
      formula: "P = (Parte / Total) × 100",
      example: "25 de 200 es (25 / 200) × 100 = 12.5%",
    },
    {
      question: "¿Cómo se calcula el X% de un número Y?",
      answer: "Para calcular el X% de un número Y, multiplica el número total Y por la tasa porcentual X y divide el resultado entre 100.",
      formula: "Resultado = Y × (X / 100)",
      example: "El 15% de 250 = 250 × (15 / 100) = 37.5",
    },
    {
      question: "¿Cómo se calcula el porcentaje de incremento?",
      answer: "Para calcular el incremento porcentual, resta el valor original al nuevo valor, divide el resultado entre el valor original y multiplícalo por 100.",
      formula: "Incremento % = ((Nuevo Valor - Valor Original) / Valor Original) × 100",
      example: "Si un precio sube de $100 a $125: ((125 - 100) / 100) × 100 = 25% de incremento",
    },
    {
      question: "¿Cómo se calcula el porcentaje de decremento?",
      answer: "Para calcular el decremento porcentual, resta el nuevo valor al valor original, divide entre el valor original y multiplica por 100.",
      formula: "Decremento % = ((Valor Original - Nuevo Valor) / Valor Original) × 100",
      example: "Si un precio baja de $200 a $150: ((200 - 150) / 200) × 100 = 25% de decremento",
    },
    {
      question: "¿Cómo se calcula la diferencia porcentual entre dos números?",
      answer: "La diferencia porcentual compara dos valores sin asumir uno como original. Divide el valor absoluto de la diferencia entre el promedio de ambos números y multiplica por 100.",
      formula: "Diferencia % = (|A - B| / ((A + B) / 2)) × 100",
      example: "Diferencia entre 10 y 20: |10 - 20| / ((10 + 20) / 2) × 100 = 10 / 15 × 100 = 66.67%",
    },
    {
      question: "¿Cómo se calcula el monto de descuento y el precio final?",
      answer: "Multiplica el precio original por el porcentaje de descuento para obtener el monto ahorrado. Resta ese monto del precio original para obtener el precio final.",
      formula: "Monto Descuento = Precio × (Descuento % / 100) | Precio Final = Precio - Monto Descuento",
      example: "Artículo de $80 con 20% de descuento: Descuento = $80 × 0.20 = $16, Precio Final = $80 - $16 = $64",
    },
  ],
  "json-formatter": [
    {
      question: "¿Mis datos JSON se envían a un servidor?",
      answer: "No. El formato, la validación y la minificación se realizan localmente en tu navegador. IJMM Tools no recibe ni almacena el contenido que introduces.",
    },
    {
      question: "¿JSON permite comentarios, comillas simples o comas finales?",
      answer: "No. El estándar JSON exige comillas dobles para textos y nombres de propiedades, no admite comentarios y tampoco permite una coma después del último elemento.",
    },
    {
      question: "¿Cuál es la diferencia entre formatear y minificar JSON?",
      answer: "Formatear agrega saltos de línea y sangría para facilitar la lectura. Minificar elimina el espacio innecesario para reducir el tamaño, sin cambiar los datos.",
    },
    {
      question: "¿Un valor simple puede ser JSON válido?",
      answer: "Sí. Además de objetos y arreglos, un documento JSON puede contener como valor raíz un texto, un número, true, false o null.",
    },
    {
      question: "¿Por qué la herramienta advierte sobre enteros muy grandes?",
      answer: "JavaScript no puede representar con exactitud enteros fuera de su rango seguro. Para evitar cambios silenciosos, la herramienta te pide convertir esos identificadores o números en texto usando comillas.",
    },
  ],
  "password-generator": [
    {
      question: "¿Las contraseñas generadas se guardan o se envían a un servidor?",
      answer: "No. La generación ocurre localmente mediante la función criptográfica segura del navegador. IJMM Tools no recibe, registra ni almacena la contraseña.",
    },
    {
      question: "¿Qué longitud debería tener una contraseña segura?",
      answer: "Para cuentas importantes recomendamos al menos 16 caracteres. Una longitud de 20 o más caracteres, combinada con varios grupos de símbolos, ofrece un margen de seguridad mayor.",
    },
    {
      question: "¿Puedo reutilizar la misma contraseña en varias cuentas?",
      answer: "No es recomendable. Utiliza una contraseña única para cada servicio, de modo que una filtración no comprometa tus demás cuentas.",
    },
    {
      question: "¿Para qué sirve excluir caracteres ambiguos?",
      answer: "Elimina caracteres que pueden confundirse visualmente, como I, l, 1, O y 0. Es útil cuando necesitas copiar una contraseña manualmente.",
    },
    {
      question: "¿Debo guardar la contraseña en un gestor de contraseñas?",
      answer: "Sí. Un gestor confiable permite conservar contraseñas largas y únicas sin depender de la memoria. Activa también la autenticación multifactor cuando el servicio la ofrezca.",
    },
  ],
  "qr-code-generator": [
    {
      question: "¿El contenido del código QR se envía a un servidor?",
      answer: "No. La matriz QR se codifica y dibuja localmente en tu navegador. IJMM Tools no recibe ni almacena los enlaces, textos o credenciales Wi-Fi introducidos.",
    },
    {
      question: "¿Cómo creo un código QR para compartir Wi-Fi?",
      answer: "Selecciona Red Wi-Fi, escribe el nombre de la red, el tipo de seguridad y la contraseña. Al escanearlo, los dispositivos compatibles podrán preparar la conexión automáticamente.",
    },
    {
      question: "¿Qué nivel de corrección de errores debo usar?",
      answer: "El nivel medio es adecuado para la mayoría de usos. Los niveles alto y máximo toleran más daño o suciedad, pero crean códigos más densos y admiten menos contenido.",
    },
    {
      question: "¿Puedo cambiar los colores del código QR?",
      answer: "Sí, siempre que el código sea más oscuro que el fondo y exista suficiente contraste. La herramienta bloquea combinaciones que podrían dificultar el escaneo.",
    },
    {
      question: "¿El código QR descargado caduca?",
      answer: "No. El archivo contiene directamente el texto introducido y no depende de una redirección de IJMM Tools. Sin embargo, un enlace dentro del QR puede dejar de funcionar si su destino cambia.",
    },
  ],
  "calculadora-iva-ecuador": [
    {
      question: "¿Cuál es la tarifa general de IVA en Ecuador?",
      answer: "La tarifa general vigente es 15%, de acuerdo con la información oficial del SRI revisada el 25 de agosto de 2026. Algunas operaciones tienen tarifas distintas según su naturaleza y fecha.",
    },
    {
      question: "¿Cómo se agrega el IVA a un subtotal?",
      answer: "Multiplica el subtotal por la tarifa dividida entre 100 para obtener el IVA y suma ambos valores para hallar el total.",
      formula: "IVA = subtotal × (tarifa / 100); total = subtotal + IVA",
      example: "Con subtotal de $100 y tarifa de 15%: IVA = $15 y total = $115.",
    },
    {
      question: "¿Cómo se extrae el IVA de un precio total?",
      answer: "Divide el total entre uno más la tarifa expresada como decimal. La diferencia entre el total y esa base es el IVA incluido.",
      formula: "Subtotal = total / (1 + tarifa / 100); IVA = total − subtotal",
      example: "Con un total de $115 y tarifa de 15%: subtotal = $100 e IVA = $15.",
    },
    {
      question: "¿Cuándo se aplican las tarifas de 0%, 5% u 8%?",
      answer: "La tarifa 0% corresponde a bienes y servicios señalados por la normativa; la de 5% puede aplicar a determinados materiales de construcción; y la de 8% solo a reducciones temporales autorizadas para actividades turísticas. Debes verificar cada operación y fecha en el SRI.",
    },
    {
      question: "¿Cómo redondea los resultados la calculadora?",
      answer: "La herramienta conserva precisión decimal durante el cálculo y redondea cada resultado monetario al centavo más cercano.",
    },
  ],
  "unit-converter": [
    {
      question: "¿Qué unidades permite convertir la herramienta?",
      answer: "Incluye unidades métricas e imperiales de longitud, peso y masa, temperatura, área y volumen, como metros, millas, kilogramos, libras, Celsius, Fahrenheit, litros y galones estadounidenses.",
    },
    {
      question: "¿Cómo se convierten metros a pies?",
      answer: "Multiplica la cantidad de metros por 3.280839895. La calculadora utiliza la equivalencia exacta de un pie igual a 0.3048 metros.",
      formula: "pies = metros ÷ 0.3048",
      example: "1 metro = 3.280839895 pies.",
    },
    {
      question: "¿Cómo se convierten kilogramos a libras?",
      answer: "Divide los kilogramos entre 0.45359237, que es la cantidad exacta de kilogramos definida para una libra internacional.",
      formula: "libras = kilogramos ÷ 0.45359237",
      example: "10 kilogramos ≈ 22.0462262185 libras.",
    },
    {
      question: "¿Cómo se convierten grados Celsius a Fahrenheit?",
      answer: "Multiplica los grados Celsius por 9/5 y suma 32. Para convertir Fahrenheit a Celsius, resta 32 y multiplica por 5/9.",
      formula: "°F = (°C × 9/5) + 32",
      example: "100 °C = 212 °F.",
    },
    {
      question: "¿La herramienta guarda los valores introducidos?",
      answer: "No. Todas las conversiones se realizan localmente en tu navegador y los valores no se envían ni almacenan en los servidores de IJMM System.",
    },
  ],
  "calculadora-van-tir": [
    {
      question: "¿Qué es el VAN y cómo se interpreta?",
      answer: "El Valor Actual Neto suma todos los flujos del proyecto llevados al presente con la tasa de descuento. Si el VAN es positivo, el proyecto rinde más que esa tasa; si es negativo, rinde menos; si es 0, rinde exactamente la tasa.",
      formula: "VAN = Σ FCₜ ÷ (1 + i)ᵗ, desde t = 0 hasta n",
      example: "Inversión −1000 y flujos 300, 400 y 500 al 10 %: 300/1.1 + 400/1.1² + 500/1.1³ − 1000 = −21.04",
    },
    {
      question: "¿Qué es la TIR?",
      answer: "La Tasa Interna de Retorno es la tasa de descuento que hace que el VAN sea exactamente 0. Si la TIR es mayor que la tasa exigida, el proyecto conviene.",
      formula: "Σ FCₜ ÷ (1 + TIR)ᵗ = 0",
    },
    {
      question: "¿Por qué mi resultado no coincide con VNA de Excel?",
      answer: "La función VNA de Excel descuenta también el primer valor que recibe. Para obtener el VAN con la inversión en el periodo 0 se usa =VNA(tasa; FC1:FCn) + FC0. Con esa fórmula el resultado coincide con esta calculadora. La TIR equivale a =TIR(FC0:FCn).",
    },
    {
      question: "¿Por qué aparecen dos TIR o ninguna?",
      answer: "Cuando los flujos cambian de signo más de una vez (por ejemplo, una inversión adicional a mitad del proyecto) pueden existir varias TIR, y la calculadora las muestra todas. Si los flujos no cambian de signo, no existe TIR. En esos casos decide con el VAN.",
    },
  ],
  "calculadora-matrices": [
    {
      question: "¿Los resultados son exactos?",
      answer: "Sí. Todos los cálculos se hacen con fracciones exactas, sin redondeo. Por eso la inversa puede mostrar valores como 3/2 o −1/4. También puedes ver el equivalente decimal.",
    },
    {
      question: "¿Cómo escribo la matriz?",
      answer: "Una fila por línea y los valores separados por espacios o punto y coma. Se aceptan enteros, decimales con punto o coma y fracciones como 1/3.",
      example: "1 2 3\n0 1 4\n5 6 0",
    },
    {
      question: "¿Cuándo una matriz no tiene inversa?",
      answer: "Cuando no es cuadrada o cuando su determinante es 0 (matriz singular). En ese caso sus filas son linealmente dependientes y su rango es menor que su tamaño.",
      formula: "A⁻¹ existe ⇔ det(A) ≠ 0",
    },
    {
      question: "¿Qué método se usa?",
      answer: "Eliminación gaussiana para el determinante y Gauss-Jordan sobre la matriz aumentada [A | I] para la inversa, el rango y la forma escalonada reducida.",
    },
  ],
  "resolver-ecuaciones": [
    {
      question: "¿Cómo se resuelve una ecuación de segundo grado?",
      answer: "Con la fórmula general. El discriminante indica el tipo de raíces: si es positivo hay dos raíces reales, si es 0 una raíz doble y si es negativo dos raíces complejas conjugadas.",
      formula: "x = (−b ± √(b² − 4ac)) ÷ 2a",
      example: "x² − 5x + 6 = 0: Δ = 25 − 24 = 1, x = (5 ± 1) ÷ 2, x₁ = 3 y x₂ = 2",
    },
    {
      question: "¿Por qué el resultado aparece con raíces como 1 + √2?",
      answer: "Porque es el valor exacto. La raíz se simplifica (√8 = 2√2) y además se muestra el valor decimal con 10 decimales.",
    },
    {
      question: "¿Cómo sé si un sistema de ecuaciones tiene solución?",
      answer: "Por el teorema de Rouché-Frobenius. Si el rango de la matriz de coeficientes es menor que el de la matriz ampliada, no hay solución. Si ambos rangos son iguales al número de incógnitas, la solución es única. Si son iguales pero menores, hay infinitas soluciones y la calculadora las expresa en función de las variables libres.",
    },
  ],
  "generador-tablas-de-verdad": [
    {
      question: "¿Qué símbolos puedo usar?",
      answer: "Negación: ¬ ~ ! o NOT. Conjunción: ∧ & ^ o AND. Disyunción: ∨ | u OR. Disyunción exclusiva: ⊕ o XOR. Condicional: → -> o =>. Bicondicional: ↔ <-> o <=>. Las variables son letras sueltas (p, q, r…) y también puedes usar 1 y 0 como constantes.",
    },
    {
      question: "¿En qué orden se evalúan los conectivos?",
      answer: "Primero la negación, luego la conjunción, después la disyunción (y la disyunción exclusiva), luego el condicional y al final el bicondicional. El condicional agrupa por la derecha: p → q → r es p → (q → r). Si tienes dudas, usa paréntesis.",
    },
    {
      question: "¿Qué es una tautología, una contradicción y una contingencia?",
      answer: "Es tautología si la proposición es verdadera en todas las filas, contradicción si es falsa en todas y contingencia si es verdadera en algunas y falsa en otras.",
      example: "p ∨ ¬p es tautología; p ∧ ¬p es contradicción; p → q es contingencia.",
    },
    {
      question: "¿Por qué la tabla empieza con V?",
      answer: "Se sigue la convención de los textos de lógica en español: la primera fila tiene todas las variables verdaderas y la última todas falsas.",
    },
  ],
  "calculadora-dias-habiles": [
    {
      question: "¿Qué feriados de Ecuador se incluyen?",
      answer: "Los feriados nacionales del art. 65 del Código del Trabajo: 1 de enero, lunes y martes de carnaval, viernes santo, 1 y 24 de mayo, 10 de agosto, 9 de octubre, 2 y 3 de noviembre y 25 de diciembre. Se aplican los traslados de la reforma publicada en el Registro Oficial Suplemento 906 del 20 de diciembre de 2016.",
    },
    {
      question: "¿Cómo se trasladan los feriados?",
      answer: "Si el feriado cae martes, se descansa el lunes anterior; si cae miércoles o jueves, el viernes de esa semana; si cae sábado, el viernes anterior; si cae domingo, el lunes siguiente. El 1 de enero, el 25 de diciembre y el martes de carnaval no se trasladan entre semana. Para el 2 y 3 de noviembre hay reglas especiales porque son días consecutivos.",
    },
    {
      question: "¿El calendario puede cambiar?",
      answer: "Sí. El Presidente de la República puede fijar o modificar el calendario de feriados y suspender la jornada mediante decreto ejecutivo. Tampoco se incluyen los feriados provinciales o cantonales. Puedes agregar o quitar fechas en la lista antes de calcular.",
    },
    {
      question: "¿Se cuentan la fecha inicial y la final?",
      answer: "Al contar días hábiles entre dos fechas se incluyen ambas, igual que DIAS.LAB de Excel. Al sumar días hábiles no se cuenta la fecha inicial, igual que DIA.LAB. Antes de un trámite, verifica cómo cuenta los plazos la norma que te aplica.",
    },
  ],
};
