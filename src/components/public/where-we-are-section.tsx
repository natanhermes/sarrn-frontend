import { MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PublicSiteSettings } from "@/lib/public-api";

type WhereWeAreSectionProps = {
  settings: PublicSiteSettings | null;
};

const WHATSAPP_MESSAGE =
  "Olá, sejam vindos(as)! Em que podemos ajudar?";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function toTelHref(phone: string) {
  const digits = digitsOnly(phone);
  return digits ? `tel:${digits}` : null;
}

function toWhatsAppHref(whatsapp: string) {
  const digits = digitsOnly(whatsapp);
  if (!digits) {
    return null;
  }

  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const text = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${withCountry}?text=${text}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.85 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhereWeAreSection({ settings }: WhereWeAreSectionProps) {
  const locationText = settings?.locationText?.trim() || "";
  const phoneHref = settings?.phoneNumber?.trim()
    ? toTelHref(settings.phoneNumber)
    : null;
  const whatsappHref = settings?.whatsappNumber?.trim()
    ? toWhatsAppHref(settings.whatsappNumber)
    : null;
  const mapsUrl = settings?.googleMapsUrl?.trim() || null;

  if (!locationText && !phoneHref && !whatsappHref && !mapsUrl) {
    return null;
  }

  return (
    <section
      id="onde-estamos"
      className="w-full bg-brand-red py-16 text-white"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 text-center md:px-8">
        <MapPin className="size-10 text-white" aria-hidden />
        <h2 className="mt-4 mb-6 inline-block rounded-full bg-red-400/50 px-6 py-2 text-xl font-bold text-white md:text-2xl">
          Onde estamos?
        </h2>

        {locationText ? (
          <p className="text-2xl font-bold text-balance md:text-3xl">
            {locationText}
          </p>
        ) : null}

        {phoneHref ? (
          <div className="mt-6">
            <Button
              size="lg"
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<a href={phoneHref} />}
            >
              <Phone className="size-4" />
              Ligar
            </Button>
          </div>
        ) : null}

        {mapsUrl || whatsappHref ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {mapsUrl ? (
              <Button
                size="lg"
                className="bg-orange-500 text-white hover:bg-orange-600 [a]:hover:bg-orange-600"
                nativeButton={false}
                render={
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" />
                }
              >
                Google Maps
              </Button>
            ) : null}

            {whatsappHref ? (
              <Button
                size="lg"
                className="bg-[#25D366] text-white hover:bg-[#1ebe57] [a]:hover:bg-[#1ebe57]"
                nativeButton={false}
                render={
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
