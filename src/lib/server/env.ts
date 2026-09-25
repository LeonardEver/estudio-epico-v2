/**
 * Server-side environment access.
 *
 * NEVER import this module from client code (it lives under src/lib/server/
 * which is import-protected) and NEVER log the values read here.
 *
 * In development the process does not automatically load `.env`, so we load it
 * ourselves and re-load it whenever the file changes (tracked by mtime), so
 * edits are picked up without restarting the dev server. Real environment
 * variables are only overridden by a newer `.env` value for keys that were
 * previously loaded from the file.
 */
import { existsSync, readFileSync, statSync } from "node:fs";

/** Variables required to CREATE an order (briefing → Sheets → Cakto charge). */
const ORDER_REQUIRED_VARS = [
  "CAKTO_CLIENT_ID",
  "CAKTO_CLIENT_SECRET",
  "CAKTO_OFFER_ID_BASE",
  "CAKTO_OFFER_ID_BUNDLE",
  "GOOGLE_SPREADSHEET_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
] as const;

let lastLoaded: { mtimeMs: number; keys: string[] } | undefined;

function tryLoadDotEnv() {
  if (typeof process.loadEnvFile !== "function" || !existsSync(".env")) return;

  let stat;
  try {
    stat = statSync(".env");
  } catch {
    return;
  }
  if (lastLoaded && lastLoaded.mtimeMs === stat.mtimeMs) return;

  // Collect key names from the file so we can drop previously-loaded values
  // before re-loading (otherwise edited values would never update).
  let text: string;
  try {
    text = readFileSync(".env", "utf8");
  } catch {
    return;
  }
  const keys: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    if (match?.[1]) keys.push(match[1]);
  }

  // Delete every key we know from the .env file — including ones we loaded
  // before and ones Vite itself injected into process.env at dev-server
  // startup (Node's loadEnvFile never overrides existing values, so without
  // this the startup snapshot would silently win over newer file edits).
  const keysToDelete = new Set<string>([...(lastLoaded?.keys ?? []), ...keys]);
  for (const key of keysToDelete) delete process.env[key];
  try {
    process.loadEnvFile(".env");
  } catch (error) {
    console.error("[env] Failed to load .env file:", error);
  }
  lastLoaded = { mtimeMs: stat.mtimeMs, keys };
}

export function env(name: string): string | undefined {
  tryLoadDotEnv();
  return process.env[name];
}

export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/**
 * Which variables required for order creation are still unconfigured
 * (names only, never values). Other flows (webhook, e-mail) check their own
 * variables independently — a missing RESEND key must never block a briefing.
 */
export function missingOrderEnvVars(): string[] {
  return ORDER_REQUIRED_VARS.filter((key) => !env(key));
}

/**
 * Google service account private keys often arrive with escaped "\n" instead
 * of real line breaks, and are frequently pasted with extra surrounding
 * quotes (e.g. `""-----BEGIN...""`). Normalize before signing JWTs.
 */
export function privateKeyValue(): string {
  const raw = requireEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").trim();
  const unquoted = raw.replace(/^"+|"+$/g, "");
  return unquoted.replace(/\\n/g, "\n");
}
