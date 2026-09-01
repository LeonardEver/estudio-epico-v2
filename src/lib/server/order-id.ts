/**
 * Human-readable, sufficiently-unique order IDs: MUS-20260831-7KQ2
 *
 * The 4-character suffix is drawn from a 30-character alphabet (no 0/O/1/I)
 * giving ~810k combinations per day — more than enough for manual production,
 * and uniqueness is additionally enforced by checking the sheet before use.
 */
import { randomBytes } from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function suffix(): string {
  const bytes = randomBytes(4);
  let out = "";
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return out;
}

function datePart(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function generateOrderId(now = new Date()): string {
  return `MUS-${datePart(now)}-${suffix()}`;
}
