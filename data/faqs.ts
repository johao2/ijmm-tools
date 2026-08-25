import { FAQItem } from "@/lib/tools/types";

export const FAQS_BY_TOOL_ID: Record<string, FAQItem[]> = {
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
};
