import { GraduationCap, Sprout, Users } from "lucide-react";

import type { PublicStatistic } from "@/lib/public-api";

const pilares = [
  { icon: Sprout, titulo: "Agroecologia", cor: "text-brand-green" },
  { icon: GraduationCap, titulo: "Educação", cor: "text-brand-orange" },
  { icon: Users, titulo: "Comunidade", cor: "text-brand-pink" },
];

type QuemSomosProps = {
  statistics?: PublicStatistic[];
};

export function QuemSomos({ statistics = [] }: QuemSomosProps) {
  return (
    <section
      id="instituicao"
      className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <div className="overflow-hidden rounded-3xl">
            <img
              src="/images/institucional.png"
              alt="Equipe e voluntários da SARRN reunidos em atividade"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute -right-4 -bottom-6 hidden rounded-2xl bg-brand-green px-6 py-5 text-white shadow-xl sm:block md:-right-6">
            <p className="text-3xl leading-none font-extrabold">+70 anos</p>
            <p className="mt-1 text-sm text-white/85">
              transformando o semiárido
            </p>
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold tracking-widest text-brand-green uppercase">
            Quem somos
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance leading-tight md:text-4xl">
            Uma rede que semeia autonomia e renda no Rio Grande do Norte
          </h2>
          <p className="mt-5 leading-relaxed text-pretty text-muted-foreground">
            A SARRN é uma organização da sociedade civil que atua junto a
            comunidades rurais do semiárido potiguar. Nossa missão é promover o
            desenvolvimento sustentável por meio da agroecologia, da educação do
            campo e do fortalecimento comunitário — respeitando os saberes
            locais e ampliando direitos.
          </p>
          <p className="mt-4 leading-relaxed text-pretty text-muted-foreground">
            Acreditamos que a transformação nasce da participação. Por isso,
            cada projeto é construído lado a lado com as famílias, garantindo
            que os resultados sejam duradouros e pertençam a quem vive no
            território.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {pilares.map((p) => (
              <div
                key={p.titulo}
                className="flex items-center gap-2.5 rounded-full border border-border bg-secondary px-4 py-2"
              >
                <p.icon className={`size-4 ${p.cor}`} />
                <span className="text-sm font-semibold">{p.titulo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {statistics.length > 0 ? (
        <div className="mt-20 grid grid-cols-2 gap-6 rounded-3xl border border-border bg-secondary/60 p-8 md:grid-cols-4 md:p-10">
          {statistics.map((item) => (
            <div key={item.id} className="text-center">
              <p className="text-3xl font-extrabold tracking-tight text-brand-green md:text-4xl">
                {item.value}
              </p>
              <p className="mt-1.5 text-sm font-medium text-foreground/80">
                {item.title}
              </p>
              {item.description ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
