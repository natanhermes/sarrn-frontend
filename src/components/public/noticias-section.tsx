import { ArrowRight, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/format";
import type { PublicPost } from "@/lib/public-api";
import { getPublicPostPath, resolvePublicMediaUrl } from "@/lib/public-api";

type NoticiasSectionProps = {
  news: PublicPost[];
};

export function NoticiasSection({ news }: NoticiasSectionProps) {
  const [destaque, ...restantes] = news;

  return (
    <section
      id="noticias"
      className="bg-secondary/50 px-5 py-16 md:px-8 md:py-16"
    >
      <div className="mx-auto max-w-6xl ">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="text-lg font-semibold tracking-widest text-brand-green uppercase">
              Últimas notícias
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance leading-tight md:text-4xl">
              O que está acontecendo na SARRN
            </h2>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="self-start md:self-auto"
            nativeButton={false}
            render={<Link href="/noticias" />}
          >
            Ver todas as notícias
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {news.length === 0 ? (
          <p className="mt-14 text-sm text-muted-foreground">
            Nenhuma notícia publicada no momento.
          </p>
        ) : (
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {destaque ? (
              <Link
                href={getPublicPostPath(destaque)}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-black/5"
              >
                <div className="relative aspect-16/10 overflow-hidden">
                  <Image
                    src={
                      resolvePublicMediaUrl(destaque.coverImageUrl) ||
                      "/placeholder.svg"
                    }
                    alt={destaque.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between gap-3 text-xs font-medium">
                    <span className="rounded-full bg-brand-pink/10 px-2.5 py-1 font-semibold text-brand-green">
                      Notícia
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {formatDateBR(destaque.publishedAt || destaque.createdAt)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl leading-snug font-bold tracking-tight text-balance">
                    {destaque.title}
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed text-pretty text-muted-foreground">
                    {destaque.summary || "Leia a matéria completa."}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-black">
                    Ler matéria completa
                    <ArrowRight className="size-4 text-brand-green" />
                  </span>
                </div>
              </Link>
            ) : null}

            <div className="flex flex-col gap-6">
              {restantes.map((noticia) => (
                <Link
                  key={noticia.id}
                  href={getPublicPostPath(noticia)}
                  className="group flex gap-5 overflow-hidden rounded-3xl border border-border bg-card p-4 transition-shadow duration-300 hover:shadow-lg hover:shadow-brand-black/5"
                >
                  <div className="relative w-32 shrink-0 self-stretch overflow-hidden rounded-2xl sm:w-40">
                    <Image
                      src={
                        resolvePublicMediaUrl(noticia.coverImageUrl) ||
                        "/placeholder.svg"
                      }
                      alt={noticia.title}
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center py-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="font-semibold text-brand-green">
                        Notícia
                      </span>
                      <span aria-hidden>•</span>
                      <span>
                        {formatDateBR(noticia.publishedAt || noticia.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-bold tracking-tight text-balance leading-snug">
                      {noticia.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                      {noticia.summary || "Leia a matéria completa."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
