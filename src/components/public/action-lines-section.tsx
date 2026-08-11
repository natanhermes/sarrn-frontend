import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  getPublicActionLinePath,
  resolvePublicMediaUrl,
  type PublicActionLineSummary,
} from "@/lib/public-api";

type ActionLinesSectionProps = {
  actionLines: PublicActionLineSummary[];
};

export function ActionLinesSection({ actionLines }: ActionLinesSectionProps) {
  if (actionLines.length === 0) {
    return null;
  }

  return (
    <section id="linhas-de-atuacao" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-4 inline-block rounded-full bg-brand-green px-8 py-2 text-3xl font-bold text-brand-black">
            Linhas de Atuação
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Trabalhamos para atender a vários setores da sociedade.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actionLines.map((line) => {
            const iconSrc =
              resolvePublicMediaUrl(line.iconUrl) || "/placeholder.svg";
            const href = getPublicActionLinePath(line);

            return (
              <article
                key={line.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-secondary/80 to-background p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-lg"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-orange via-brand-green to-brand-orange opacity-80" />

                <div className="relative mb-5 size-20 overflow-hidden rounded-2xl bg-brand-orange/15 ring-4 ring-brand-orange/10 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={iconSrc}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <h3 className="text-xl font-bold tracking-tight text-balance">
                  {line.title}
                </h3>

                {line.summary ? (
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-pretty text-muted-foreground">
                    {line.summary}
                  </p>
                ) : (
                  <div className="flex-1" />
                )}

                <Link
                  href={href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-green transition-colors group-hover:text-brand-green"
                >
                  Saiba mais
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
