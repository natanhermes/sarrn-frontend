import {
  resolvePublicMediaUrl,
  type PublicFunder,
  type PublicFundersGrouped,
} from "@/lib/public-api";

type ApoiadoresSectionProps = {
  fundersGrouped: PublicFundersGrouped;
};

function normalizeExternalUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}

function FunderLogoGrid({
  funders,
  compact = false,
}: {
  funders: PublicFunder[];
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 items-stretch"
          : "mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 items-stretch"
      }
    >
      {funders.map((funder) => {
        const logoSrc =
          resolvePublicMediaUrl(funder.logoUrl) || "/placeholder.svg";
        const siteUrl = normalizeExternalUrl(funder.siteUrl ?? "");

        const content = (
          <>
            <div className="flex flex-1 items-center justify-center w-full">
              <img
                src={logoSrc}
                alt={funder.name}
                className={
                  compact
                    ? "h-14 w-full max-w-[140px] object-cover opacity-90 transition-transform duration-300 group-hover:scale-105 md:h-16 lg:h-20"
                    : "h-20 w-full max-w-[180px] object-cover transition-transform duration-300 group-hover:scale-105 md:h-24 lg:h-28"
                }
              />
            </div>
            <span
              className={
                compact
                  ? "mt-3 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground text-center md:text-sm"
                  : "mt-4 text-sm font-semibold text-foreground/90 transition-colors group-hover:text-brand-green text-center md:text-base"
              }
            >
              {funder.name}
            </span>
          </>
        );

        const cardClasses =
          "group flex flex-col items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-md hover:shadow-brand-black/5";

        if (siteUrl) {
          return (
            <a
              key={funder.id}
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visitar site de ${funder.name}`}
              className={cardClasses}
            >
              {content}
            </a>
          );
        }

        return (
          <div key={funder.id} className={cardClasses}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

export function ApoiadoresSection({ fundersGrouped }: ApoiadoresSectionProps) {
  const activeSupporters = (fundersGrouped.supporters ?? []).filter(
    (funder) => funder.isActive !== false,
  );
  const activePartners = (fundersGrouped.partners ?? []).filter(
    (funder) => funder.isActive !== false,
  );

  if (activeSupporters.length === 0 && activePartners.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border bg-gradient-to-b from-secondary/60 to-secondary/30 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-5 md:px-8">
        {activeSupporters.length > 0 ? (
          <div>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold tracking-widest text-brand-green uppercase">
                Quem Apoia Nossa Causa
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                Apoiadores e Financiadores
              </h2>
            </div>
            <FunderLogoGrid funders={activeSupporters} />
          </div>
        ) : null}

        {activePartners.length > 0 ? (
          <div>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                Parcerias Institucionais
              </span>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Organizações e instituições que caminharam conosco ao longo da
                nossa história.
              </p>
            </div>
            <FunderLogoGrid funders={activePartners} compact />
          </div>
        ) : null}
      </div>
    </section>
  );
}
