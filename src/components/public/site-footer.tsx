import { Mail, MapPin, Phone } from "lucide-react";

import { SarrnLogo } from "@/components/public/sarrn-logo";
import type { PublicSiteSettings } from "@/lib/public-api";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.85 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const navegacao = [
  { label: "Início", href: "/#inicio" },
  { label: "A Instituição", href: "/#instituicao" },
  { label: "Projetos", href: "/#projetos" },
  { label: "Notícias", href: "/#noticias" },
  { label: "Agenda", href: "/agenda" },
];

const projetosLinks = [
  { label: "Projetos", href: "/projetos" },
  { label: "Notícias", href: "/noticias" },
  { label: "Publicações", href: "/publicacoes" },
  { label: "Cartilhas", href: "/publicacoes?type=BOOKLET" },
  { label: "E-books", href: "/publicacoes?type=EBOOK" },
  { label: "Artigos", href: "/publicacoes?type=ARTICLE" },
  { label: "Biblioteca", href: "/publicacoes?type=LIBRARY" },
];

const redes = [
  {
    logo: "/brands/whatsapp.svg",
    label: "WhatsApp",
    href: "https://api.whatsapp.com/send?phone=5584996288269&text=Ol%C3%A1%21%20Seja%20bem-vindo%28a%29%21%20Como%20podemos%20ajudar%20voc%C3%AA%3F",
  },
  {
    logo: "/brands/instagram.svg",
    label: "Instagram",
    href: "https://www.instagram.com/sarnatalrn/",
  },
  {
    logo: "/brands/youtube.svg",
    label: "YouTube",
    href: "https://www.youtube.com/sarnatalrn",
  },
  {
    logo: "/brands/facebook.svg",
    label: "Facebook",
    href: "https://www.facebook.com/sarrn.org.br/",
  },
];

const WHATSAPP_MESSAGE = "Olá, sejam vindos(as)! Em que podemos ajudar?";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function toTelHref(phone: string) {
  const digits = digitsOnly(phone);
  return digits ? `tel:+55${digits}` : null;
}

function toWhatsAppHref(whatsapp: string) {
  const digits = digitsOnly(whatsapp);
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

function formatPhoneDisplay(phone: string) {
  const digits = digitsOnly(phone);
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return phone.trim();
}

type SiteFooterProps = {
  settings?: PublicSiteSettings | null;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  const locationText = settings?.locationText?.trim() || "Av. Mal. Floriano Peixoto, 674 - Tirol, Natal - RN, 59020-500";
  const mapsUrl = settings?.googleMapsUrl?.trim() || null;
  const emailText = "sar@sarrn.org.br | sararquidiocese@gmail.com";

  const phoneRaw = settings?.phoneNumber?.trim() || "";
  const whatsappRaw = settings?.whatsappNumber?.trim() || "";

  const telHref = phoneRaw ? toTelHref(phoneRaw) : null;
  const waHref = whatsappRaw ? toWhatsAppHref(whatsappRaw) : null;

  const phoneDisplay = phoneRaw ? formatPhoneDisplay(phoneRaw) : "";
  const whatsappDisplay = whatsappRaw ? formatPhoneDisplay(whatsappRaw) : "";

  const hasPhone = telHref && phoneDisplay;
  const hasWhatsapp = waHref && whatsappDisplay;

  return (
    <footer id="transparencia" className="bg-brand-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <SarrnLogo invert />
            <p className="mt-5 max-w-xs text-pretty text-sm leading-relaxed text-white/60">
              Semeando autonomia e renda no Rio Grande do Norte por meio da
              agroecologia, da educação e do desenvolvimento comunitário.
            </p>
            <div className="mt-6 flex gap-2.5">
              {redes.map((rede) => (
                <a
                  key={rede.label}
                  href={rede.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={rede.label}
                  className="grid size-9 place-items-center rounded-full bg-white/95 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <img
                    src={rede.logo || "/placeholder.svg"}
                    alt=""
                    className="size-4"
                  />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Navegação</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Conteúdo</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {projetosLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Contato</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-green" />
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir endereço no Google Maps"
                    className="transition-colors hover:text-white"
                  >
                    {locationText}
                  </a>
                ) : (
                  <span>{locationText}</span>
                )}
              </li>

              {hasPhone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand-green" />
                  <a
                    href={telHref}
                    aria-label="Ligar para o telefone"
                    className="transition-colors hover:text-white"
                  >
                    {phoneDisplay}
                  </a>
                </li>
              )}

              {hasWhatsapp && (
                <li className="flex items-start gap-2.5">
                  <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-brand-green" />
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir WhatsApp"
                    className="transition-colors hover:text-white"
                  >
                    {whatsappDisplay}
                  </a>
                </li>
              )}

              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand-green" />
                {emailText}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 md:flex-row">
          <p>
            © 2026 SARRN — Todos os direitos reservados. CNPJ
            08.344.459/0001-14
          </p>
        </div>
      </div>
    </footer>
  );
}
