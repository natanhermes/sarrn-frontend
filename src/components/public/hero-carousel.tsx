"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { heroSlides } from "@/lib/public-content";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  badgeText?: string | null;
  title: string;
  subtitle?: string | null;
  primaryButtonText?: string | null;
  primaryButtonUrl?: string | null;
  secondaryButtonText?: string | null;
  secondaryButtonUrl?: string | null;
};

function toFallbackSlides(): HeroSlide[] {
  return heroSlides.map((slide, index) => ({
    id: `fallback-${index}`,
    imageUrl: slide.imagem,
    badgeText: slide.tag,
    title: slide.titulo,
    subtitle: slide.subtitulo,
    primaryButtonText: "Conheça nossos projetos",
    primaryButtonUrl: "#projetos",
    secondaryButtonText: "Sobre a instituição",
    secondaryButtonUrl: "#instituicao",
  }));
}

type HeroCarouselProps = {
  slides?: HeroSlide[];
};

export function HeroCarousel({ slides = [] }: HeroCarouselProps) {
  const items = slides.length > 0 ? slides : toFallbackSlides();
  const [index, setIndex] = useState(0);
  const count = items.length;
  const current = items[index] ?? items[0];

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (count <= 1) {
      return;
    }

    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(id);
  }, [count]);

  if (!current) {
    return null;
  }

  const showPrimary =
    Boolean(current.primaryButtonText?.trim()) &&
    Boolean(current.primaryButtonUrl?.trim());
  const showSecondary =
    Boolean(current.secondaryButtonText?.trim()) &&
    Boolean(current.secondaryButtonUrl?.trim());

  return (
    <section
      id="inicio"
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden"
    >
      {items.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <img
            src={slide.imageUrl || "/placeholder.svg"}
            alt=""
            className={cn(
              "h-full w-full object-cover",
              i === index && "animate-kenburns",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/55 to-brand-black/40" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-24 md:px-8 md:pb-32">
        <div key={current.id} className="max-w-2xl animate-fade-up">
          {current.badgeText ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-green/90 px-3.5 py-1.5 text-xs font-semibold text-white">
              {current.badgeText}
            </span>
          ) : null}
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
            {current.title}
          </h1>
          {current.subtitle ? (
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/85 md:text-lg">
              {current.subtitle}
            </p>
          ) : null}
          {(showPrimary || showSecondary) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {showPrimary ? (
                <Button
                  size="lg"
                  nativeButton={false}
                  className="h-12 bg-brand-green px-6 text-base text-white hover:bg-brand-green/90"
                  render={<a href={current.primaryButtonUrl!} />}
                >
                  {current.primaryButtonText}
                  <ArrowRight className="size-4" />
                </Button>
              ) : null}
              {showSecondary ? (
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  className="h-12 border-white/30 bg-white/5 px-6 text-base text-white backdrop-blur hover:bg-white/15 hover:text-white"
                  render={<a href={current.secondaryButtonUrl!} />}
                >
                  {current.secondaryButtonText}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {count > 1 ? (
        <div className="absolute right-5 bottom-8 z-10 flex items-center gap-3 md:right-8">
          <div className="mr-1 flex items-center gap-1.5">
            {items.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index
                    ? "w-7 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Slide anterior"
            className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/5 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Próximo slide"
            className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/5 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
