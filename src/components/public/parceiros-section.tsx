import {
  resolvePublicMediaUrl,
  type PublicPartner,
} from "@/lib/public-api";

type ParceirousSectionProps = {
  partners: PublicPartner[];
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

export function ParceirosSection({ partners }: ParceirousSectionProps) {
  const activePartners = partners
    .filter((partner) => partner.isActive !== false)
    .sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  if (activePartners.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border bg-gradient-to-b from-secondary/40 to-secondary/20 py-16">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold tracking-widest text-brand-green uppercase">
            Quem Caminha Conosco
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            Parceiros
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 items-stretch">
          {activePartners.map((partner) => {
            const logoSrc =
              resolvePublicMediaUrl(partner.logoUrl) || "/placeholder.svg";
            const siteUrl = normalizeExternalUrl(partner.siteUrl ?? "");

            const content = (
              <>
                <div className="flex flex-1 items-center justify-center w-full">
                  <img
                    src={logoSrc}
                    alt={partner.name}
                    className="h-20 w-full max-w-[180px] object-cover transition-transform duration-300 group-hover:scale-105 md:h-24 lg:h-28"
                  />
                </div>
                <span className="mt-4 text-sm font-semibold text-foreground/90 transition-colors group-hover:text-brand-green text-center md:text-base">
                  {partner.name}
                </span>
              </>
            );

            const cardClasses =
              "group flex flex-col items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-md hover:shadow-brand-black/5";

            if (siteUrl) {
              return (
                <a
                  key={partner.id}
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visitar site de ${partner.name}`}
                  className={cardClasses}
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={partner.id} className={cardClasses}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
