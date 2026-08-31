# Landing page de vendas — Música personalizada (R$150 → R$67)

Rebuild `/` from scratch as a dark, premium, conversion-first sales page. Current `/` is still the blank template placeholder, so this is a full build.

## Section order (fixed)

1. Hero da oferta
2. Vídeo UGC
3. O que você recebe
4. Como funciona (3 passos)
5. Exemplos de áudio
6. Prova social + valor + objeções
7. FAQ
8. Oferta final
9. Rodapé

Plus a sticky mobile CTA that appears after the hero.

## Visual direction

- Backgrounds `#0A0A0D` / `#111116`, surfaces `#18181E`, text `#FFFFFF` / `#A7A7B0`, accent `#C83B5A` with `#F05A78` highlight.
- Very subtle purple/blue atmospheric glows only; no neon, no green/cyan, no rainbow.
- Tall immersive hero with a generated realistic dark studio photo (monitors, MIDI keyboard, warm lighting) behind a strong gradient scrim — not a blog header.
- Big display typography, generous section rhythm, minimal card usage (cards only where they earn it: benefits, audio, objections, FAQ).
- Subtle Motion animations: fade/slide/scale, 150–250ms, on section entry only.

## Section details

**Hero** — eyebrow "PRODUÇÃO MUSICAL PERSONALIZADA", headline "Sua ideia vira uma música profissional.", subheadline as specified, price block with small crossed-out R$150 above a dominant R$67, CTA "QUERO MINHA MÚSICA →", three micro-badges (Pagamento único / Produção personalizada / Entrega digital), and the trust line "Você não precisa saber produzir música."

**UGC** — headline "Veja o que acontece quando uma ideia vira música.", a large centered 9:16 player in a rounded premium frame with soft shadow, poster + play overlay, `muted` and no autoplay, source path constant `/ugc.mp4` defined at the top of the component. Caption below: "Experiência real de um cliente". No fabricated testimonial text. CTA after this section.

**O que você recebe** — 6 benefits exactly as listed in the brief, icon + short line, no invented services. CTA after this section.

**Como funciona** — 3 steps (01 Você conta a ideia / 02 Nós produzimos / 03 Você recebe), oversized numerals, one short line each.

**Exemplos de áudio** — premium player cards (title, genre, mood, play/pause, waveform bars, progress). No autoplay, one track at a time. Tracks reference files under `/audio/*.mp3`; until real files are added the cards render in a clearly labelled empty/disabled state instead of faking playback.

**Prova social** — component driven by an empty testimonials array, rendering neutral placeholder slots `[DEPOIMENTO REAL SERÁ INSERIDO AQUI]`; adding real entries later fills the grid.

**Valor** — "Produção profissional sem complicação." with the four "você não precisa..." points.

**Objeções** — 4 concise cards (não sei produzir / não tenho letra / não sei o gênero / tenho referência mas não sei explicar) with short answers.

**FAQ** — the 8 listed questions in an accordion. Answers that depend on undefined policy (prazo de entrega, ajustes/revisões, formato de entrega) use visibly editable placeholders like `[DEFINIR: prazo de entrega]` rather than invented promises.

**Oferta final** — repeats the anchor R$150 ↓ R$67, headline "Sua ideia já existe. Agora transforme ela em música.", CTA, "Pagamento único".

**Rodapé** — minimal: brand, contato placeholder, ano.

## Mobile first

Built at 375px first and verified up through 1440px: large type, full-width 56px+ CTA, no horizontal scroll, sticky bottom CTA bar with the R$67 price that appears once the hero scrolls out.

## Technical notes

- Route: rewrite `src/routes/index.tsx` with SEO head (pt-BR title/description/og/twitter).
- Components in `src/components/landing/`: `HeroOffer`, `UGCVideo`, `BenefitGrid`, `HowItWorks`, `AudioShowcase`, `TestimonialSection`, `ValueSection`, `ObjectionSection`, `FAQ`, `FinalOffer`, `StickyMobileCTA`, plus a shared `CTAButton`.
- Add the palette as semantic tokens in `src/styles.css` (oklch, dark-first); no hardcoded color classes in components.
- Install `motion` for animations; icons from `lucide-react` (already present).
- Hero image generated into `src/assets/` and imported.
- All CTAs point to a single `CHECKOUT_URL` constant (placeholder `#` until you provide the checkout link).

## Needs your input later (non-blocking)

- `ugc.mp4` video file, checkout URL, real audio examples, real testimonials, delivery time / revision policy.
