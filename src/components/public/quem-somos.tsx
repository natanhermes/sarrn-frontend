import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { resolvePublicMediaUrl, type PublicAboutUs, type PublicStatistic } from "@/lib/public-api";
import { hasValidBlocks } from "@/lib/utils";

type QuemSomosProps = {
  aboutUs?: PublicAboutUs | null;
  statistics?: PublicStatistic[];
};

export function QuemSomos({ aboutUs, statistics = [] }: QuemSomosProps) {
  const currentYear = new Date().getFullYear();
  const foundationYear = aboutUs?.foundationYear ?? 1950;
  const ageYears = currentYear - foundationYear;

  const imageUrl =
    resolvePublicMediaUrl(aboutUs?.imageUrl) || "/images/institucional.png";
  const title =
    aboutUs?.title?.trim() ||
    "Uma rede que semeia autonomia e renda no Rio Grande do Norte";
  const summary =
    aboutUs?.summary?.trim() ||
    "A SARRN é uma organização da sociedade civil que atua junto a comunidades rurais do semiárido potiguar. Nossa missão é promover o desenvolvimento sustentável por meio da agroecologia, da educação do campo e do fortalecimento comunitário — respeitando os saberes locais e ampliando direitos.";
  const badgeText = aboutUs?.badgeText?.trim() || "transformando o semiárido";
  const hasDetailedContent = hasValidBlocks(aboutUs?.detailedBlocks);

  return (
    <section
      id="instituicao"
      className="bg-secondary/60 px-5 py-16 md:px-8 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl">
              <Image
                src={imageUrl}
                alt="Equipe e voluntários da SARRN reunidos em atividade"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -right-4 -bottom-6 hidden rounded-2xl bg-brand-green px-6 py-5 text-white shadow-xl sm:block md:-right-6">
              <p className="text-3xl leading-none font-extrabold">+{ageYears} anos</p>
              <p className="mt-1 text-sm text-white/85">{badgeText}</p>
            </div>
          </div>

          <div className="">
            <span className="text-xl font-semibold tracking-widest text-brand-green uppercase">
              Quem somos
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance leading-tight md:text-4xl">
              {title}
            </h2>
            <div className="mt-5 whitespace-pre-line leading-relaxed text-pretty text-muted-foreground max-h-80 overflow-y-auto pr-4 custom-scrollbar">
              {summary}
            </div>

            {aboutUs?.tags && aboutUs.tags.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {aboutUs.tags.map((tag, idx) => {
                  const iconResolved = resolvePublicMediaUrl(tag.iconUrl);

                  return (
                    <div
                      key={tag.id || idx}
                      className="flex items-center gap-2.5 rounded-full border border-border bg-secondary px-4 py-2"
                    >
                      {iconResolved ? (
                        <img
                          src={iconResolved}
                          alt=""
                          className="size-4 object-contain"
                          style={{ color: tag.iconColor }}
                        />
                      ) : (
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tag.iconColor || "#356e7c" }}
                        />
                      )}
                      <span className="text-sm font-semibold">{tag.title}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {hasDetailedContent ? (
              <div className="mt-8">
                <Button
                  size="lg"
                  nativeButton={false}
                  className="bg-brand-green text-white hover:bg-brand-green/90"
                  render={<Link href="/quem-somos" />}
                >
                  Saiba mais
                  <ArrowRightIcon className="ml-1 size-4" />
                </Button>
              </div>
            ) : null}
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
      </div>
    </section>
  );
}
