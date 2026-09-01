import { Quote } from "lucide-react";
import { Reveal } from "./Reveal";

type Testimonial = { name: string; text: string };

// Edite aqui: adicione depoimentos reais e os placeholders somem automaticamente.
const testimonials: Testimonial[] = [];

const PLACEHOLDER_SLOTS = 3;

export function TestimonialSection() {
  const slots = testimonials.length > 0 ? testimonials : new Array(PLACEHOLDER_SLOTS).fill(null);

  return (
    <section className="border-y border-border bg-surface/40 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-5xl">
            Quem já transformou uma ideia em música
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {slots.map((item: Testimonial | null, i: number) => (
            <Reveal key={i} delay={i * 0.04}>
              <article className="h-full rounded-2xl border border-border bg-surface-2/60 p-6">
                <Quote className="size-5 text-accent" />
                {item ? (
                  <>
                    <p className="mt-4 text-sm leading-relaxed">{item.text}</p>
                    <p className="mt-4 text-xs text-muted-foreground">{item.name}</p>
                  </>
                ) : (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    [DEPOIMENTO REAL SERÁ INSERIDO AQUI]
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
