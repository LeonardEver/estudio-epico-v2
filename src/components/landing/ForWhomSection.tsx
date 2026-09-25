import {
  Briefcase,
  Building2,
  Cake,
  Gift,
  Heart,
  HeartHandshake,
  Home,
  Instagram,
  Megaphone,
  Music,
  Store,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { ScrollCTA } from "./ScrollCTA";

type UseCase = { icon: typeof Gift; label: string };

// Histórias pessoais — o coração do produto.
const personal: UseCase[] = [
  { icon: Gift, label: "Presentes" },
  { icon: Cake, label: "Aniversários" },
  { icon: Heart, label: "Homenagens" },
  { icon: HeartHandshake, label: "Casamentos" },
  { icon: Home, label: "Famílias" },
  { icon: Music, label: "Histórias de amor" },
];

// A mesma música aplicada a um negócio: comunicação, campanha e conteúdo.
// Não é um produto B2B separado — o posicionamento continua amplo.
const business: UseCase[] = [
  { icon: Building2, label: "Empresas" },
  { icon: Store, label: "Lojas e comércios" },
  { icon: Megaphone, label: "Campanhas" },
  { icon: Briefcase, label: "Marcas e serviços" },
  { icon: Instagram, label: "Redes sociais" },
  { icon: Music, label: "Jingles" },
];

function UseGroup({ title, note, items }: { title: string; note: string; items: UseCase[] }) {
  return (
    <div className="rounded-3xl border border-border bg-surface/40 p-6 text-center sm:p-7">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">{title}</p>
      <p className="mx-auto mt-2 max-w-xs text-xs text-muted-foreground">{note}</p>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={(i % 3) * 0.03}>
            <div className="flex flex-col items-center gap-2.5">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/15">
                <item.icon className="size-5 text-accent" />
              </span>
              <p className="text-sm font-semibold">{item.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function ForWhomSection() {
  return (
    <section id="para-quem" className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <Reveal>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
            Para quem é
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-bold sm:text-5xl">
            Feita para o seu momento.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Em vez de mais um presente comum, você entrega uma música com nome, história e emoção. A
            mesma ideia também pode virar o som do seu negócio.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 text-left sm:gap-6 lg:grid-cols-2">
          <Reveal>
            <UseGroup
              title="Histórias e pessoas"
              note="Uma música que carrega o nome, a história e o momento de quem você ama."
              items={personal}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <UseGroup
              title="Marcas e negócios"
              note="Jingle, campanha ou trilha para a sua marca ou o seu comércio — criada sob medida."
              items={business}
            />
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <p className="mx-auto mt-9 max-w-md text-sm text-muted-foreground sm:text-base">
            Se você se viu em uma dessas situações,{" "}
            <span className="text-foreground">você está no lugar certo.</span>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-7">
            <ScrollCTA target="voce-recebe" label="VER O QUE VOCÊ RECEBE" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
