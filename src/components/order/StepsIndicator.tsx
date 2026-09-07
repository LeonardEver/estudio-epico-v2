import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS, type Step } from "./order-state";

/** Indicador minimalista de progresso do pedido: 01 Música → 02 Extras → 03 Pagamento. */
export function StepsIndicator({
  current,
  onGoTo,
}: {
  current: Step;
  onGoTo: (step: Step) => void;
}) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <ol className="flex items-center" aria-label="Progresso do pedido">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = step.id === current;
        const reachable = i <= currentIndex;
        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => reachable && onGoTo(step.id)}
              disabled={!reachable}
              className={cn(
                "flex items-center gap-2 rounded-full transition-colors",
                reachable ? "cursor-pointer" : "cursor-default",
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-xs font-bold transition-colors sm:size-9",
                  done &&
                    "border-transparent bg-[image:var(--gradient-price)] text-primary-foreground",
                  active && "border-transparent bg-primary/20 text-accent",
                  !done && !active && "border-border bg-surface text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : step.n}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold sm:text-sm",
                  active || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mx-2 h-px flex-1 sm:mx-3",
                  i < currentIndex ? "bg-primary/50" : "bg-foreground/10",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
