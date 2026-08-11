import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import type { PublicPost } from "@/lib/public-api";
import { getPublicPostPath, resolvePublicMediaUrl } from "@/lib/public-api";
import type { ExecutionStatus } from "@/schemas/posts";

type ProjetosSectionProps = {
  projects: PublicPost[];
};

export function ProjetosSection({ projects }: ProjetosSectionProps) {
  return (
    <section id="projetos" className="bg-secondary/50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="text-sm font-semibold tracking-widest text-brand-orange uppercase">
              Projetos em ação
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance leading-tight md:text-4xl">
              Iniciativas que germinam mudanças reais
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-pretty text-muted-foreground">
              Do campo à sala de aula, conheça as frentes de trabalho que movem a
              SARRN todos os dias.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="self-start md:self-auto"
            nativeButton={false}
            render={<Link href="/projetos" />}
          >
            Ver todos os projetos
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {projects.length === 0 ? (
          <p className="mt-14 text-sm text-muted-foreground">
            Nenhum projeto publicado no momento.
          </p>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {projects.map((projeto) => {
              const cover =
                resolvePublicMediaUrl(projeto.coverImageUrl) ||
                "/placeholder.svg";
              const executionStatus = projeto.projectDetails
                ?.executionStatus as ExecutionStatus | undefined;

              return (
                <Link
                  key={projeto.id}
                  href={getPublicPostPath(projeto)}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-black/5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cover}
                      alt={projeto.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {executionStatus ? (
                      <div className="absolute top-4 left-4">
                        <StatusBadge
                          status={executionStatus}
                          className="bg-background/90 backdrop-blur"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg leading-snug font-bold tracking-tight">
                      {projeto.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-pretty text-muted-foreground">
                      {projeto.summary ||
                        "Projeto em desenvolvimento institucional."}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green">
                      Saiba mais
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
