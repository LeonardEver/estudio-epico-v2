/**
 * Shared briefing contract: types + validation schema.
 * Safe to import from client and server code (no server-only dependencies).
 */
import { z } from "zod";

export const GENRES = [
  "Sertanejo",
  "Pop",
  "Pagode",
  "Funk",
  "Rock",
  "Eletrônica",
  "MPB",
  "Gospel",
  "Samba",
  "Rap / Hip-Hop",
  "Outro",
] as const;

export const MOODS = [
  "Romântica",
  "Alegre",
  "Emocionante",
  "Energética",
  "Inspiradora",
  "Melancólica",
  "Divertida",
  "Sombria",
  "Calma",
  "Épica",
] as const;

export type Genre = (typeof GENRES)[number];
export type Mood = (typeof MOODS)[number];

export const LYRICS_PREFERENCES = [
  { value: "HAS_LYRICS", label: "Eu já tenho a letra" },
  { value: "CREATE_LYRICS", label: "Quero que vocês criem a letra" },
] as const;

export type BriefFormValues = {
  name: string;
  email: string;
  whatsapp: string;
  lyricsPreference: "HAS_LYRICS" | "CREATE_LYRICS";
  lyrics: string;
  description: string;
  genre: Genre;
  genreOther: string;
  mood: Mood[];
  recipient?: string;
  occasion?: string;
  references?: string;
};

/** Extras opcionais oferecidos na página de pedido. */
export const EXTRAS = ["COVER", "EXCLUSIVE_PAGE"] as const;
export type Extra = (typeof EXTRAS)[number];

export type PaymentMethod = "PIX" | "CARD";

export type OrderFormValues = BriefFormValues & {
  extras: Extra[];
  bundle: boolean;
  paymentMethod: PaymentMethod;
  /**
   * CPF do titular (com máscara, como digitado). Só existe no estado do wizard:
   * NÃO faz parte do briefObjectSchema, então a validação da etapa 01 (música)
   * nunca exige um campo que o cliente ainda não viu. A validação de verdade
   * acontece no passo de pagamento e, de novo, no servidor.
   */
  cpf: string;
  /**
   * Código de cupom digitado. Também fora do briefObjectSchema (mesmo motivo
   * do CPF). O frontend só EXIBE o desconto; quem decide se ele vale é o
   * servidor + a Cakto.
   */
  coupon: string;
};

/**
 * Schema-BASE do briefing (sem refinements). Use este objeto quando precisar
 * `.extend()` — o resultado de `.superRefine()` é um ZodEffects, que NÃO tem
 * `.extend()` (TypeError em runtime).
 */
export const briefObjectSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo").max(120, "Nome muito longo"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido")
    .max(200, "E-mail muito longo"),
  whatsapp: z
    .string()
    .trim()
    .min(8, "Informe seu WhatsApp")
    .max(40, "WhatsApp muito longo")
    .refine(
      (value) => /^[+]?[\d\s()-]{8,20}$/.test(value),
      "Informe um WhatsApp válido (somente números)",
    ),
  lyricsPreference: z.enum(["HAS_LYRICS", "CREATE_LYRICS"]),
  lyrics: z.string().max(4000, "Letra muito longa (máx. 4000 caracteres)"),
  description: z
    .string()
    .trim()
    .min(10, "Conte um pouco mais sobre sua ideia (mín. 10 caracteres)")
    .max(2000, "Descrição muito longa (máx. 2000 caracteres)"),
  genre: z.enum(GENRES),
  genreOther: z.string().trim().max(80, "Gênero muito longo"),
  mood: z.array(z.enum(MOODS)).max(10).optional(),
  recipient: z.string().trim().max(120, "Nome muito longo").optional(),
  occasion: z.string().trim().max(120, "Texto muito longo").optional(),
  references: z.string().trim().max(2000, "Texto muito longo (máx. 2000 caracteres)").optional(),
  extras: z.array(z.enum(EXTRAS)).max(2).optional(),
  bundle: z.boolean().optional(),
  paymentMethod: z.enum(["PIX", "CARD"]).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
});

/** Refinements cross-field do briefing — reaplicável em schemas derivados. */
export function briefRefine(values: z.infer<typeof briefObjectSchema>, ctx: z.RefinementCtx): void {
  if (values.lyricsPreference === "HAS_LYRICS" && !values.lyrics.trim()) {
    ctx.addIssue({ code: "custom", path: ["lyrics"], message: "Conte ou cole sua letra" });
  }
  if (values.genre === "Outro" && !values.genreOther) {
    ctx.addIssue({
      code: "custom",
      path: ["genreOther"],
      message: "Digite o gênero musical",
    });
  }
}

export const briefSchema = briefObjectSchema.superRefine(briefRefine);

export type BriefInput = z.input<typeof briefSchema>;
