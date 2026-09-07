import { Building2, Cake, Gift, Heart, HeartHandshake, Home, Mail, Megaphone } from "lucide-react";
import { Reveal } from "./Reveal";
import { ScrollCTA } from "./ScrollCTA";

const situations = [
  { icon: Cake, label: "Aniversários" },
  { icon: Heart, label: "Homenagens" },
  { icon: Gift, label: "Presentes" },
  { icon: HeartHandshake, label: "Casamentos" },
  { icon: Home, label: "Famílias" },
  { icon: Mail, label: "Histórias de amor" },
  { icon: Building2, label: "Empresas" },
  { icon: Megaphone, label: "Marcas e comércios" },
];

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
            Em vez de mais um presente comum, você entrega uma música com nome, história e emoção:
          </p>
        </Reveal>

        <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {situations.map((s, i) => (
            <Reveal key={s.label} delay={(i % 4) * 0.03}>
              <div className="flex flex-col items-center gap-2.5">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/15">
                  <s.icon className="size-5 text-accent" />
                </span>
                <p className="text-sm font-semibold">{s.label}</p>
              </div>
            </Reveal>
          ))}
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
