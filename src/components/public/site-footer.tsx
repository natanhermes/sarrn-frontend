import { Mail, MapPin, Phone } from "lucide-react";

import { SarrnLogo } from "@/components/public/sarrn-logo";

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
  { label: "Documentos", href: "/publicacoes?type=DOCUMENT" },
  { label: "Relatórios", href: "/publicacoes?type=REPORT" },
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
  }
];

export function SiteFooter() {
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
                Av. Floriano Peixoto, 674 - Tirol, Natal/RN
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-brand-green" />
                (84) 3615-2801
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand-green" />
                sar@sarrn.org.br | sararquidiocese@gmail.com
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
