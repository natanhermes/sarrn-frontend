import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";

import type { PublicSiteSettings } from "@/lib/public-api";

const DEFAULT_ADDRESS =
  "Av. Mal. Floriano Peixoto, 674 - Tirol, Natal - RN, 59020-500";
const DEFAULT_OPENING_HOURS = "Segunda a Sexta: 09:00–12:00, 13:30–17:00";

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return phone.trim();
}

export interface WhereWeAreSectionProps {
  settings?: PublicSiteSettings | null;
  address?: string;
  phone?: string;
  openingHours?: string;
  mapsUrl?: string;
}

export function WhereWeAreSection({
  settings,
  address,
  phone,
  openingHours = DEFAULT_OPENING_HOURS,
  mapsUrl,
}: WhereWeAreSectionProps) {
  const resolvedAddress =
    address?.trim() ||
    settings?.locationText?.trim() ||
    DEFAULT_ADDRESS;

  const resolvedPhone =
    phone?.trim() ||
    settings?.phoneNumber?.trim() ||
    "";

  const rawPhoneDigits = resolvedPhone.replace(/\D/g, "");
  const telHref = rawPhoneDigits ? `tel:${rawPhoneDigits}` : null;
  const displayPhone = resolvedPhone ? formatPhoneDisplay(resolvedPhone) : "";

  const encodedAddress = encodeURIComponent(resolvedAddress);

  const mapsLink =
    mapsUrl?.trim() ||
    settings?.googleMapsUrl?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="onde-estamos" className="w-full bg-slate-100 py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Card de Informações (Coluna Esquerda) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green">
                Localização & Contato
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                Venha nos fazer uma visita
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Estamos de portas abertas para receber você.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Informações de Contato */}
            <div className="space-y-4">
              {/* Endereço */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-red-50 text-brand-green rounded-lg shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400">
                    Endereço
                  </h4>
                  <p className="text-sm font-medium text-slate-700 leading-snug mt-0.5">
                    {resolvedAddress}
                  </p>
                </div>
              </div>

              {/* Horário */}
              {openingHours && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-red-50 text-brand-green rounded-lg shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-400">
                      Funcionamento
                    </h4>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {openingHours}
                    </p>
                  </div>
                </div>
              )}

              {/* Telefone */}
              {displayPhone && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-red-50 text-brand-green rounded-lg shrink-0">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-400">
                      Telefone / Contato
                    </h4>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {displayPhone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className={`grid ${telHref ? "grid-cols-2" : "grid-cols-1"} gap-3 pt-4`}>
            {telHref && (
              <a
                href={telHref}
                className="flex items-center justify-center gap-2 bg-brand-orange text-white text-sm font-semibold py-3 px-4 rounded-xl hover:bg-brand-orange/80 transition-colors shadow-sm"
              >
                <Phone className="size-4" />
                Ligar
              </a>
            )}

            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-700 text-sm font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="size-4" />
              Rotas
            </a>
          </div>
        </div>

        {/* Mapa Interativo (Coluna Direita) */}
        <div className="lg:col-span-7 h-[380px] lg:h-auto min-h-[350px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <iframe
            title="Localização no Google Maps"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
          />
        </div>
      </div>
    </section>
  );
}

export const LocationSection = WhereWeAreSection;
export type LocationSectionProps = WhereWeAreSectionProps;
