const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_DIGITS = "0123456789";

function secureCharacter(alphabet: string) {
  const maximum = 256 - (256 % alphabet.length);
  const bytes = new Uint8Array(1);

  while (true) {
    crypto.getRandomValues(bytes);
    if (bytes[0] < maximum) {
      return alphabet[bytes[0] % alphabet.length];
    }
  }
}

export function generateAccessCode() {
  const digits = Array.from({ length: 6 }, () => secureCharacter(CODE_DIGITS)).join("");
  const suffix = Array.from({ length: 4 }, () => secureCharacter(CODE_LETTERS)).join("");
  return `GU-${digits}-${suffix}`;
}

export function normalizeAccessCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function accessCodeHint(code: string) {
  return `GU-******-${code.slice(-4)}`;
}

export async function hashAccessCode(code: string) {
  const bytes = new TextEncoder().encode(normalizeAccessCode(code));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
