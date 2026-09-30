/**
 * Tablas de verdad de lógica proposicional.
 * Precedencia (de mayor a menor): ¬, ∧, ∨ y ⊕, →, ↔. La condicional y la bicondicional se agrupan por la derecha.
 */

export type LogicNode =
  | { type: "var"; name: string }
  | { type: "const"; value: boolean }
  | { type: "not"; arg: LogicNode }
  | { type: "and" | "or" | "xor" | "imp" | "iff"; left: LogicNode; right: LogicNode };

type BinaryOp = "and" | "or" | "xor" | "imp" | "iff";

type Token = { kind: "var"; name: string } | { kind: "const"; value: boolean } | { kind: "not" } | { kind: "op"; op: BinaryOp } | { kind: "(" } | { kind: ")" };

export const MAX_VARIABLES = 6;

export const SYMBOLS: Record<BinaryOp | "not", string> = { not: "¬", and: "∧", or: "∨", xor: "⊕", imp: "→", iff: "↔" };

const KEYWORDS: Record<string, Token> = {
  NOT: { kind: "not" },
  AND: { kind: "op", op: "and" },
  OR: { kind: "op", op: "or" },
  XOR: { kind: "op", op: "xor" },
};

// Símbolos de varios caracteres primero
const MULTI: [string, Token][] = [
  ["<->", { kind: "op", op: "iff" }],
  ["<=>", { kind: "op", op: "iff" }],
  ["->", { kind: "op", op: "imp" }],
  ["=>", { kind: "op", op: "imp" }],
  ["&&", { kind: "op", op: "and" }],
  ["||", { kind: "op", op: "or" }],
];

const SINGLE: Record<string, Token> = {
  "¬": { kind: "not" },
  "~": { kind: "not" },
  "!": { kind: "not" },
  "∧": { kind: "op", op: "and" },
  "&": { kind: "op", op: "and" },
  "^": { kind: "op", op: "and" },
  "∨": { kind: "op", op: "or" },
  "|": { kind: "op", op: "or" },
  "⊕": { kind: "op", op: "xor" },
  "⊻": { kind: "op", op: "xor" },
  "→": { kind: "op", op: "imp" },
  "⇒": { kind: "op", op: "imp" },
  "↔": { kind: "op", op: "iff" },
  "⇔": { kind: "op", op: "iff" },
  "(": { kind: "(" },
  "[": { kind: "(" },
  "{": { kind: "(" },
  ")": { kind: ")" },
  "]": { kind: ")" },
  "}": { kind: ")" },
};

export function tokenize(input: string): { tokens: Token[] } | { error: string } {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    const multi = MULTI.find(([s]) => input.startsWith(s, i));
    if (multi) {
      tokens.push(multi[1]);
      i += multi[0].length;
      continue;
    }
    if (SINGLE[ch]) {
      tokens.push(SINGLE[ch]);
      i++;
      continue;
    }
    if (ch === "0" || ch === "1") {
      tokens.push({ kind: "const", value: ch === "1" });
      i++;
      continue;
    }
    const word = /^\p{L}+/u.exec(input.slice(i))?.[0];
    if (word) {
      const kw = KEYWORDS[word.toUpperCase()];
      if (kw && word === word.toUpperCase()) tokens.push(kw);
      else if (word.length === 1) tokens.push({ kind: "var", name: word });
      else return { error: `“${word}”: las variables deben ser de una sola letra (p, q, r…). Separa las variables con un operador.` };
      i += word.length;
      continue;
    }
    return { error: `Símbolo no reconocido: “${ch}” (posición ${i + 1}).` };
  }
  return { tokens };
}

const LEVELS: BinaryOp[][] = [["iff"], ["imp"], ["or", "xor"], ["and"]];
const RIGHT_ASSOC = new Set<BinaryOp>(["imp", "iff"]);

export type ParseResult = { success: true; ast: LogicNode; variables: string[] } | { success: false; message: string };

export function parseFormula(input: string): ParseResult {
  if (!input.trim()) return { success: false, message: "Escribe una proposición, por ejemplo: (p → q) ∧ p → q" };
  const t = tokenize(input);
  if ("error" in t) return { success: false, message: t.error };
  const tokens = t.tokens;
  let pos = 0;

  const fail = (msg: string): never => {
    throw new SyntaxError(msg);
  };

  function parseLevel(level: number): LogicNode {
    if (level === LEVELS.length) return parseUnary();
    let left = parseLevel(level + 1);
    while (true) {
      const tok = tokens[pos];
      if (tok?.kind !== "op" || !LEVELS[level].includes(tok.op)) return left;
      pos++;
      const right = RIGHT_ASSOC.has(tok.op) ? parseLevel(level) : parseLevel(level + 1);
      left = { type: tok.op, left, right };
      if (RIGHT_ASSOC.has(tok.op)) return left;
    }
  }

  function parseUnary(): LogicNode {
    const tok = tokens[pos];
    if (!tok) return fail("La proposición termina de forma incompleta: falta una variable o un paréntesis.");
    if (tok.kind === "not") {
      pos++;
      return { type: "not", arg: parseUnary() };
    }
    if (tok.kind === "var") {
      pos++;
      return { type: "var", name: tok.name };
    }
    if (tok.kind === "const") {
      pos++;
      return { type: "const", value: tok.value };
    }
    if (tok.kind === "(") {
      pos++;
      const inner = parseLevel(0);
      if (tokens[pos]?.kind !== ")") fail("Falta cerrar un paréntesis.");
      pos++;
      return inner;
    }
    return fail(tok.kind === ")" ? "Hay un paréntesis de cierre sin su apertura o una operación vacía." : "Falta una variable antes de un operador.");
  }

  try {
    const ast = parseLevel(0);
    if (pos < tokens.length) {
      const tok = tokens[pos];
      fail(tok.kind === ")" ? "Hay un paréntesis de cierre de más." : "Falta un operador entre dos términos.");
    }
    const variables = collectVariables(ast);
    if (variables.length > MAX_VARIABLES) return { success: false, message: `Máximo ${MAX_VARIABLES} variables (${2 ** MAX_VARIABLES} filas). Tu proposición tiene ${variables.length}.` };
    return { success: true, ast, variables };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

function collectVariables(node: LogicNode, acc = new Set<string>()): string[] {
  if (node.type === "var") acc.add(node.name);
  else if (node.type === "not") collectVariables(node.arg, acc);
  else if (node.type !== "const") {
    collectVariables(node.left, acc);
    collectVariables(node.right, acc);
  }
  // Orden alfabético (p, q, r…), como en los textos de lógica
  return [...acc].sort((a, b) => a.localeCompare(b, "es"));
}

const PRECEDENCE: Record<LogicNode["type"], number> = { iff: 1, imp: 2, or: 3, xor: 3, and: 4, not: 5, var: 6, const: 6 };

/** Escribe la proposición con símbolos estándar y paréntesis solo donde hacen falta. */
export function formatFormula(node: LogicNode): string {
  if (node.type === "var") return node.name;
  if (node.type === "const") return node.value ? "1" : "0";
  if (node.type === "not") {
    const inner = formatFormula(node.arg);
    return PRECEDENCE[node.arg.type] < PRECEDENCE.not ? `¬(${inner})` : `¬${inner}`;
  }
  const p = PRECEDENCE[node.type];
  const wrap = (child: LogicNode, isRight: boolean) => {
    const text = formatFormula(child);
    const cp = PRECEDENCE[child.type];
    const needs = cp < p || (cp === p && (RIGHT_ASSOC.has(node.type as BinaryOp) ? !isRight : isRight || child.type !== node.type));
    return needs ? `(${text})` : text;
  };
  return `${wrap(node.left, false)} ${SYMBOLS[node.type]} ${wrap(node.right, true)}`;
}

export function evaluate(node: LogicNode, values: Record<string, boolean>): boolean {
  switch (node.type) {
    case "var":
      return values[node.name];
    case "const":
      return node.value;
    case "not":
      return !evaluate(node.arg, values);
    case "and":
      return evaluate(node.left, values) && evaluate(node.right, values);
    case "or":
      return evaluate(node.left, values) || evaluate(node.right, values);
    case "xor":
      return evaluate(node.left, values) !== evaluate(node.right, values);
    case "imp":
      return !evaluate(node.left, values) || evaluate(node.right, values);
    case "iff":
      return evaluate(node.left, values) === evaluate(node.right, values);
  }
}

export type Classification = "tautology" | "contradiction" | "contingency";

export interface TruthTable {
  variables: string[];
  /** Columnas: primero las variables, luego cada subexpresión en orden de evaluación; la última es la proposición completa */
  columns: string[];
  rows: boolean[][];
  classification: Classification;
  trueCount: number;
}

/**
 * Construye la tabla. Las filas empiezan con todas las variables verdaderas (V V V…) y terminan con todas falsas,
 * como es habitual en los textos de lógica en español.
 */
export function buildTruthTable(ast: LogicNode, variables: string[]): TruthTable {
  const subs: LogicNode[] = [];
  const seen = new Set<string>();
  const visit = (node: LogicNode) => {
    if (node.type === "var" || node.type === "const") return;
    if (node.type === "not") visit(node.arg);
    else {
      visit(node.left);
      visit(node.right);
    }
    const key = formatFormula(node);
    if (!seen.has(key)) {
      seen.add(key);
      subs.push(node);
    }
  };
  visit(ast);
  if (subs.length === 0) subs.push(ast); // la proposición es una sola variable o constante
  const columns = [...variables, ...subs.map(formatFormula)];
  const n = variables.length;
  const rows: boolean[][] = [];
  for (let i = 0; i < 2 ** n; i++) {
    const values: Record<string, boolean> = {};
    variables.forEach((v, j) => {
      values[v] = ((i >> (n - 1 - j)) & 1) === 0;
    });
    rows.push([...variables.map((v) => values[v]), ...subs.map((s) => evaluate(s, values))]);
  }
  const trueCount = rows.filter((r) => r[r.length - 1]).length;
  const classification: Classification = trueCount === rows.length ? "tautology" : trueCount === 0 ? "contradiction" : "contingency";
  return { variables, columns, rows, classification, trueCount };
}
