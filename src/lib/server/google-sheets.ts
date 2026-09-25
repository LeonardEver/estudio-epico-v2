/**
 * Minimal Google Sheets client for the order book.
 *
 * Uses a service account (no OAuth flow) via a hand-rolled RS256 JWT so the
 * bundle stays small. Columns (row 1 = headers):
 *
 *   A order_id | B created_at | C name | D email | E whatsapp
 *   F lyrics_preference | G lyrics | H description | I genre | J genre_other
 *   K mood | L payment_status | M cakto_transaction_id | N paid_at
 *   O delivery_status | P download_url | Q notification_status
 *   R recipient | S occasion | T references | U extras | V bundle | W payment_method
 */
import { createSign } from "node:crypto";
import { env, privateKeyValue } from "./env";

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

const HEADER_COUNT = 23; // A..W

export const HEADERS = [
  "order_id",
  "created_at",
  "name",
  "email",
  "whatsapp",
  "lyrics_preference",
  "lyrics",
  "description",
  "genre",
  "genre_other",
  "mood",
  "payment_status",
  "cakto_transaction_id",
  "paid_at",
  "delivery_status",
  "download_url",
  "notification_status",
  "recipient",
  "occasion",
  "references",
  "extras",
  "bundle",
  "payment_method",
] as const;

export type OrderRow = {
  rowNumber: number;
  orderId: string;
  values: string[];
};

type ColumnUpdate = { column: string; value: string };

// ---------------------------------------------------------------------------
// Service account access token (cached until 60s before expiry)
// ---------------------------------------------------------------------------

let cachedToken: { token: string; expiresAt: number } | undefined;

async function fetchAccessToken(): Promise<string> {
  const serviceAccountEmail = env("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = privateKeyValue();
  if (!serviceAccountEmail) throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is not configured");

  const now = Math.floor(Date.now() / 1000);
  const jwt =
    toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })) +
    "." +
    toBase64Url(
      JSON.stringify({
        iss: serviceAccountEmail,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      }),
    );
  const signature = createSign("RSA-SHA256").update(jwt).sign(privateKey, "base64url");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${jwt}.${signature}`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Google OAuth token request failed with status ${response.status}`);
  }
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("Google OAuth token response missing access_token");
  return data.access_token;
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  const token = await fetchAccessToken();
  cachedToken = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return token;
}

// ---------------------------------------------------------------------------
// Sheets API calls
// ---------------------------------------------------------------------------

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

let resolvedSheetName: string | undefined;

/**
 * Returns the tab name to use. GOOGLE_SHEET_NAME wins; otherwise the first tab
 * of the spreadsheet is auto-detected (Google names the default tab "Página1"
 * on PT-BR accounts, "Sheet1" on EN ones — never assume).
 */
async function sheetName(): Promise<string> {
  if (resolvedSheetName) return resolvedSheetName;
  const configured = env("GOOGLE_SHEET_NAME");
  if (configured) {
    resolvedSheetName = configured;
    return configured;
  }
  try {
    const url = sheetsUrl("?fields=sheets.properties.title");
    const response = await sheetsRequest(url, { method: "GET" });
    const data = (await response.json()) as { sheets?: { properties?: { title?: string } }[] };
    const first = data.sheets?.[0]?.properties?.title;
    resolvedSheetName = first || "Sheet1";
  } catch {
    resolvedSheetName = "Sheet1";
  }
  return resolvedSheetName;
}

function sheetsUrl(path: string): string {
  const spreadsheetId = env("GOOGLE_SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("GOOGLE_SPREADSHEET_ID is not configured");
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/${path}`;
}

async function sheetsRequest(url: string, init: RequestInit): Promise<Response> {
  let response = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${await accessToken()}`, ...init.headers },
  });
  if (response.status === 401) {
    // Token may have been revoked — fetch a fresh one and retry once.
    cachedToken = undefined;
    response = await fetch(url, {
      ...init,
      headers: { authorization: `Bearer ${await accessToken()}`, ...init.headers },
    });
  }
  return response;
}

/**
 * Creates the header row (A1:Q1) when the sheet is empty, so a brand-new
 * spreadsheet works without manual setup.
 */
async function ensureHeaderRow(): Promise<void> {
  const name = await sheetName();
  const url = sheetsUrl(`values/${encodeURIComponent(`'${name}'!A1:Q1`)}`);
  const response = await sheetsRequest(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to inspect Google Sheet header row (status ${response.status})`);
  }
  const data = (await response.json()) as { values?: unknown[][] };
  const firstRow = data.values?.[0];
  if (firstRow && firstRow.some((cell) => String(cell ?? "").trim() !== "")) return; // headers exist

  const writeResponse = await sheetsRequest(
    sheetsUrl(`values/${encodeURIComponent(`'${name}'!A1:Q1`)}?valueInputOption=USER_ENTERED`),
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ values: [[...HEADERS]] }),
    },
  );
  if (!writeResponse.ok) {
    throw new Error(`Failed to write Google Sheet header row (status ${writeResponse.status})`);
  }
}

export async function readOrderRows(): Promise<OrderRow[]> {
  const name = await sheetName();
  const url = sheetsUrl(
    `values/${encodeURIComponent(`'${name}'!A2:Q`)}?valueRenderOption=UNFORMATTED_VALUE`,
  );
  const response = await sheetsRequest(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to read Google Sheet (status ${response.status})`);
  }
  const data = (await response.json()) as { values?: unknown[][] };
  const rows = data.values ?? [];
  if (rows.length === 0) {
    await ensureHeaderRow(); // empty sheet → create headers once
  }
  return rows.map((raw, index) => {
    const values = (raw ?? []).map((cell) => String(cell ?? ""));
    return {
      rowNumber: index + 2, // +1 for the header row, +1 because rows are 1-indexed
      orderId: values[0] ?? "",
      values,
    };
  });
}

export async function appendOrderRow(cells: string[]): Promise<void> {
  const padded = [...cells];
  while (padded.length < HEADER_COUNT) padded.push("");
  const name = await sheetName();
  const url = sheetsUrl(
    `values/${encodeURIComponent(`'${name}'!A:W`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
  );
  const response = await sheetsRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ values: [padded.slice(0, HEADER_COUNT)] }),
  });
  if (!response.ok) {
    throw new Error(`Failed to append order to Google Sheet (status ${response.status})`);
  }
}

export async function updateOrderRow(rowNumber: number, updates: ColumnUpdate[]): Promise<void> {
  const name = await sheetName();
  for (const update of updates) {
    const url = sheetsUrl(
      `values/${encodeURIComponent(`'${name}'!${update.column}${rowNumber}`)}?valueInputOption=USER_ENTERED`,
    );
    const response = await sheetsRequest(url, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ values: [[update.value]] }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update order in Google Sheet (status ${response.status})`);
    }
  }
}
