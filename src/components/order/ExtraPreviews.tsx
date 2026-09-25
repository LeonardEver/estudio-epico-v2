"use client";

import { Music2, Play, Plus, Share2 } from "lucide-react";

/**
 * Prévia visual dos extras (capa e página exclusiva).
 *
 * São MOCKUPS ILUSTRATIVOS montados com CSS — não existe imagem de entrega real
 * no projeto, então nenhuma promessa de que o resultado será idêntico. O texto
 * diz explicitamente "Exemplo de como ... pode ficar".
 *
 * O CTA "QUERO ADICIONAR" chama o MESMO onToggleExtra do card — não existe
 * fluxo paralelo de compra. Quando o extra já está selecionado (ou incluído no
 * pacote) o CTA some.
 */

/** Alturas fixas das barras do player — só decoração, sem aleatoriedade. */
const WAVE = [36, 62, 88, 54, 74, 96, 44, 68, 82, 50, 90, 58, 78, 42, 66];

function PreviewCopy({
  title,
  text,
  note,
  selected,
  onAdd,
}: {
  title: string;
  text: string;
  note: string;
  selected: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <p className="mt-2 text-xs text-muted-foreground/80">{note}</p>
      {!selected && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold tracking-wide text-foreground uppercase transition-colors hover:border-accent/70 hover:text-accent"
        >
          <Plus className="size-3.5" /> Quero adicionar
        </button>
      )}
    </div>
  );
}

export function CoverPreview({ selected, onAdd }: { selected: boolean; onAdd: () => void }) {
  return (
    <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
      {/* Mockup da capa */}
      <div
        aria-hidden
        className="relative mx-auto flex aspect-square w-40 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-[image:var(--gradient-price)] p-4"
        style={{ boxShadow: "var(--shadow-offer)" }}
      >
        <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-white/10 blur-2xl" />
        <Music2 className="size-5 text-primary-foreground/90" />
        <div className="relative">
          <p className="font-display text-base leading-tight font-extrabold text-primary-foreground">
            Sua Música
          </p>
          <p className="mt-1 text-[9px] tracking-[0.22em] text-primary-foreground/80 uppercase">
            Estúdio Épico
          </p>
        </div>
      </div>

      <PreviewCopy
        title="Prévia da entrega"
        text="Você recebe uma capa exclusiva para acompanhar sua música e deixar o lançamento com aparência profissional."
        note="Exemplo de como sua capa pode ficar."
        selected={selected}
        onAdd={onAdd}
      />
    </div>
  );
}

export function ExclusivePagePreview({
  selected,
  onAdd,
}: {
  selected: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_230px] sm:items-center">
      <div className="space-y-4">
        <PreviewCopy
          title="Prévia da entrega"
          text="Uma página exclusiva para apresentar, ouvir e compartilhar sua música."
          note="Exemplo de como sua página pode ficar."
          selected={selected}
          onAdd={onAdd}
        />
        <p className="text-xs text-muted-foreground">
          Uma página pronta para você enviar para quem quiser.
        </p>
      </div>

      {/* Mockup da página */}
      <div aria-hidden className="rounded-2xl border border-border bg-surface/60 p-3">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-foreground/20" />
          <span className="size-1.5 rounded-full bg-foreground/20" />
          <span className="size-1.5 rounded-full bg-foreground/20" />
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-background p-3">
          <span className="size-12 shrink-0 rounded-lg bg-[image:var(--gradient-price)]" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">Sua Música</span>
            <span className="block text-[10px] tracking-wide text-muted-foreground uppercase">
              Estúdio Épico
            </span>
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2.5 px-1">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-price)] text-primary-foreground">
            <Play className="ml-0.5 size-3.5 fill-current" />
          </span>
          <span className="flex h-7 flex-1 items-center gap-[2px]">
            {WAVE.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-full bg-foreground/20"
                style={{ height: `${h}%` }}
              />
            ))}
          </span>
          <span className="text-[10px] tabular-nums text-muted-foreground">0:30</span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-medium">
          <Share2 className="size-3.5" /> Compartilhar
        </div>
      </div>
    </div>
  );
}
