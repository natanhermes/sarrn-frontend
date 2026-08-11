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
          ? "mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4 lg:grid-cols-6"
          : "mt-10 grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4 lg:grid-cols-6"
      }
    >
      {funders.map((funder) => {
        const logoSrc =
          resolvePublicMediaUrl(funder.logoUrl) || "/placeholder.svg";
        const siteUrl = normalizeExternalUrl(funder.siteUrl ?? "");

        const content = (
          <>
            <img
              src={logoSrc}
              alt={funder.name}
              className={
                compact
                  ? "h-10 w-full object-contain opacity-80 md:h-12"
                  : "h-12 w-full object-contain md:h-14"
              }
            />
            <span
              className={
                compact
                  ? "mt-2 text-xs font-medium text-muted-foreground"
                  : "mt-2 text-xs font-medium text-muted-foreground md:text-sm"
              }
            >
              {funder.name}
            </span>
          </>
        );

        if (siteUrl) {
          return (
            <a
              key={funder.id}
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visitar site de ${funder.name}`}
              className="flex flex-col items-center justify-center px-2 text-center transition-transform hover:scale-105"
            >
              {content}
            </a>
          );
        }

        return (
          <div
            key={funder.id}
            className="flex flex-col items-center justify-center px-2 text-center"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

export function ApoiadoresSection({ fundersGrouped }: ApoiadoresSectionProps) {
  const { supporters, partners } = fundersGrouped;

  if (supporters.length === 0 && partners.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border bg-secondary/40 py-16 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-5 md:px-8">
        {supporters.length > 0 ? (
          <div>
            <p className="text-center text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              Quem apoia essa transformação
            </p>
            <FunderLogoGrid funders={supporters} />
          </div>
        ) : null}

        {partners.length > 0 ? (
          <div>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                Parcerias
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Organizações e instituições que caminharam conosco ao longo da
                nossa história.
              </p>
            </div>
            <FunderLogoGrid funders={partners} compact />
          </div>
        ) : null}
      </div>
    </section>
  );
}
