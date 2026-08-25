export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 128;

const CHARACTER_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
} as const;

const AMBIGUOUS_CHARACTERS = new Set("Il1O0o");

export interface PasswordOptions {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

export type PasswordStrength = "weak" | "fair" | "strong" | "very-strong";

export interface PasswordSuccess {
  success: true;
  password: string;
  charsetSize: number;
  entropyBits: number;
  strength: PasswordStrength;
}

export type PasswordErrorCode =
  | "INVALID_LENGTH"
  | "NO_CHARACTER_SET"
  | "RANDOM_UNAVAILABLE";

export interface PasswordFailure {
  success: false;
  code: PasswordErrorCode;
  message: string;
}

export type PasswordResult = PasswordSuccess | PasswordFailure;
export type RandomIntegerSource = (maximumExclusive: number) => number;

function withoutAmbiguousCharacters(characters: string): string {
  return [...characters]
    .filter((character) => !AMBIGUOUS_CHARACTERS.has(character))
    .join("");
}

function secureRandomInteger(maximumExclusive: number): number {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Web Crypto API unavailable");
  }

  const range = 0x1_0000_0000;
  const acceptanceLimit = Math.floor(range / maximumExclusive) * maximumExclusive;
  const buffer = new Uint32Array(1);
  let value: number;

  do {
    globalThis.crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= acceptanceLimit);

  return value % maximumExclusive;
}

function chooseCharacter(characters: string, randomInteger: RandomIntegerSource): string {
  const index = randomInteger(characters.length);
  if (!Number.isInteger(index) || index < 0 || index >= characters.length) {
    throw new Error("Invalid random source result");
  }
  return characters[index];
}

export function estimatePasswordStrength(
  length: number,
  charsetSize: number
): { entropyBits: number; strength: PasswordStrength } {
  const entropyBits = Math.round(length * Math.log2(charsetSize) * 10) / 10;
  const strength: PasswordStrength =
    entropyBits < 40
      ? "weak"
      : entropyBits < 60
        ? "fair"
        : entropyBits < 80
          ? "strong"
          : "very-strong";

  return { entropyBits, strength };
}

export function generatePassword(
  options: PasswordOptions,
  randomInteger: RandomIntegerSource = secureRandomInteger
): PasswordResult {
  if (
    !Number.isInteger(options.length) ||
    options.length < MIN_PASSWORD_LENGTH ||
    options.length > MAX_PASSWORD_LENGTH
  ) {
    return {
      success: false,
      code: "INVALID_LENGTH",
      message: `La longitud debe ser un número entero entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH}.`,
    };
  }

  const enabledSets = [
    options.includeLowercase ? CHARACTER_SETS.lowercase : "",
    options.includeUppercase ? CHARACTER_SETS.uppercase : "",
    options.includeNumbers ? CHARACTER_SETS.numbers : "",
    options.includeSymbols ? CHARACTER_SETS.symbols : "",
  ]
    .filter(Boolean)
    .map((characters) =>
      options.excludeAmbiguous ? withoutAmbiguousCharacters(characters) : characters
    )
    .filter(Boolean);

  if (enabledSets.length === 0) {
    return {
      success: false,
      code: "NO_CHARACTER_SET",
      message: "Selecciona al menos un grupo de caracteres.",
    };
  }

  const characterPool = enabledSets.join("");

  try {
    const passwordCharacters = enabledSets.map((characters) =>
      chooseCharacter(characters, randomInteger)
    );

    while (passwordCharacters.length < options.length) {
      passwordCharacters.push(chooseCharacter(characterPool, randomInteger));
    }

    for (let index = passwordCharacters.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInteger(index + 1);
      if (!Number.isInteger(swapIndex) || swapIndex < 0 || swapIndex > index) {
        throw new Error("Invalid random source result");
      }
      [passwordCharacters[index], passwordCharacters[swapIndex]] = [
        passwordCharacters[swapIndex],
        passwordCharacters[index],
      ];
    }

    return {
      success: true,
      password: passwordCharacters.join(""),
      charsetSize: characterPool.length,
      ...estimatePasswordStrength(options.length, characterPool.length),
    };
  } catch {
    return {
      success: false,
      code: "RANDOM_UNAVAILABLE",
      message: "El navegador no pudo proporcionar aleatoriedad segura. Actualízalo e inténtalo nuevamente.",
    };
  }
}
