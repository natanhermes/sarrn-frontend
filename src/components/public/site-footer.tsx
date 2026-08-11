import { Mail, MapPin, Phone } from "lucide-react";

import { SarrnLogo } from "@/components/public/sarrn-logo";

const navegacao = [
  { label: "Início", href: "/#inicio" },
  { label: "A Instituição", href: "/#instituicao" },
  { label: "Projetos", href: "/projetos" },
  { label: "Notícias", href: "/noticias" },
  { label: "Publicações", href: "/publicacoes" },
  { label: "Transparência", href: "/#transparencia" },
];

const projetosLinks = [
  { label: "Ver projetos", href: "/projetos" },
  { label: "Notícias", href: "/noticias" },
  { label: "Publicações", href: "/publicacoes" },
  { label: "Transparência", href: "/#transparencia" },
];

const redes = [
  { logo: "/brands/instagram.svg", label: "Instagram" },
  { logo: "/brands/facebook.svg", label: "Facebook" },
  { logo: "/brands/linkedin.svg", label: "LinkedIn" },
  { logo: "/brands/youtube.svg", label: "YouTube" },
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
                  href="#"
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
                Rua das Acácias, 210 — Caicó/RN
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-brand-green" />
                (84) 3421-0000
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand-green" />
                contato@sarrn.org.br
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 md:flex-row">
          <p>
            © 2026 SARRN — Todos os direitos reservados. CNPJ
            00.000.000/0001-00
          </p>
          <div className="flex gap-5">
            <a href="#" className="transition-colors hover:text-white/80">
              Política de Privacidade
            </a>
            <a href="#" className="transition-colors hover:text-white/80">
              Relatórios Financeiros
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
