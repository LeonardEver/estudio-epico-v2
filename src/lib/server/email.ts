/**
 * Owner notification via Resend's REST API (no SDK needed).
 *
 * Payment confirmation must NEVER depend on this call: callers catch failures,
 * log them, and keep the order PAID.
 */
import { env } from "./env";

export type OrderForEmail = {
  orderId: string;
  createdAt: string;
  name: string;
  email: string;
  whatsapp: string;
  lyricsPreference: string;
  lyrics: string;
  description: string;
  genre: string;
  genreOther: string;
  mood: string[];
  txId: string | undefined;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cell(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #2a2a35;color:#8b8b99;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #2a2a35;color:#f4f4f6;font-size:14px;line-height:1.5;word-break:break-word;">${escapeHtml(value) || '<span style="color:#6b6b78;">—</span>'}</td>
    </tr>`;
}

function section(title: string, rows: string): string {
  return `
    <h2 style="margin:28px 0 8px;padding:0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;color:#ffb199;text-transform:uppercase;letter-spacing:0.14em;">${escapeHtml(title)}</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#1b1b23;border:1px solid #2a2a35;border-radius:10px;overflow:hidden;">
      ${rows}
    </table>`;
}

export function buildOwnerEmailHtml(order: OrderForEmail): string {
  const mood = order.mood.length ? order.mood.join(" · ") : "—";
  const genre =
    order.genre === "Outro" && order.genreOther ? `Outro — ${order.genreOther}` : order.genre;
  const date = new Date(order.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#101016;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:28px 18px;">
    <div style="background:linear-gradient(135deg,#ff8a65,#e5533d);border-radius:14px;padding:24px 20px;">
      <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">🎵 Novo pedido de música</h1>
      <p style="margin:6px 0 0;font-size:14px;color:#ffe8e0;">${escapeHtml(order.orderId)} — aguardando sua produção</p>
    </div>
    ${section(
      "Pedido",
      cell("Order ID", order.orderId) +
        cell("Data", date) +
        cell("Status pagamento", "PAID") +
        cell("Transação Kiwify", order.txId ?? ""),
    )}
    ${section(
      "Cliente",
      cell("Nome", order.name) + cell("E-mail", order.email) + cell("WhatsApp", order.whatsapp),
    )}
    ${section(
      "Briefing da música",
      cell("Letra", order.lyricsPreference) +
        cell("Letra enviada", order.lyrics) +
        cell("Ideia", order.description) +
        cell("Gênero", genre) +
        cell("Clima", mood),
    )}
    <p style="margin:26px 0 0;color:#6b6b78;font-size:12px;line-height:1.6;">
      Entrega manual: produza a música e envie o download para o e-mail do cliente.
      Atualize a planilha (colunas O/P) ao enviar.
    </p>
  </div>
</body>
</html>`;
}

export async function sendOwnerOrderEmail(order: OrderForEmail): Promise<void> {
  const apiKey = env("RESEND_API_KEY");
  const from = env("EMAIL_FROM");
  const to = env("NOTIFICATION_EMAIL");
  if (!apiKey || !from || !to) {
    throw new Error(
      "Resend is not configured (RESEND_API_KEY / EMAIL_FROM / NOTIFICATION_EMAIL missing)",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `🎵 NOVO PEDIDO DE MÚSICA — ${order.orderId}`,
      html: buildOwnerEmailHtml(order),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend responded with status ${response.status}`);
  }
}
