/**
 * Identificador estável do dispositivo/sessão do comprador — exigido pela
 * Cakto no objeto customer de toda cobrança. Um UUID gerado no primeiro
 * acesso e persistido em localStorage.
 */
const KEY = "epico_fingerprint";

export function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fingerprint = crypto.randomUUID();
    localStorage.setItem(KEY, fingerprint);
    return fingerprint;
  } catch {
    // localStorage indisponível (modo privado etc.) — usa um por sessão.
    return crypto.randomUUID();
  }
}
