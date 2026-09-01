/**
 * Shared briefing contract: types + validation schema.
 * Safe to import from client and server code (no server-only dependencies).
 */
import { z } from "zod";

export const GENRES = [
  "Pop",
  "Rock",
  "Sertanejo",
  "Pagode",
  "Samba",
  "Funk",
  "Rap / Hip-Hop",
  "Eletrônica",
  "Gospel",
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
};

export const briefSchema = z
  .object({
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
      .max(40, "WhatsApp muito longo")
      .refine(
        (value) => !value || /^[+]?[\d\s()-]{8,20}$/.test(value),
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
    mood: z.array(z.enum(MOODS)).min(1, "Escolha pelo menos um clima").max(10),
    utm: z.record(z.string(), z.string().max(200)).optional(),
  })
  .superRefine((values, ctx) => {
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
  });

export type BriefInput = z.input<typeof briefSchema>;
