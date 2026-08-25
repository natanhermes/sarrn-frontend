import type { PublicSiteSettings } from "@/lib/public-api";

type FloatingSocialSidebarProps = {
  settings?: PublicSiteSettings | null;
};

function formatWhatsappUrl(whatsappNumber?: string) {
  if (!whatsappNumber) {
    return "https://api.whatsapp.com/send?phone=5584996288269&text=Ol%C3%A1%21%20Seja%20bem-vindo%28a%29%21%20Como%20podemos%20ajudar%20voc%C3%AA%3F";
  }
  const digits = whatsappNumber.replace(/\D/g, "");
  const fullDigits = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://api.whatsapp.com/send?phone=${fullDigits}`;
}

export function FloatingSocialSidebar({ settings }: FloatingSocialSidebarProps) {
  const whatsappHref = formatWhatsappUrl(settings?.whatsappNumber);
  const instagramHref =
    settings?.instagramUrl || "https://www.instagram.com/sarnatalrn/";
  const youtubeHref =
    settings?.youtubeUrl || "https://www.youtube.com/sarnatalrn";
  const facebookHref =
    settings?.facebookUrl || "https://www.facebook.com/sarrn.org.br/";

  const socialLinks = [
    {
      label: "WhatsApp",
      href: whatsappHref,
      logo: "/brands/whatsapp.svg",
    },
    {
      label: "Instagram",
      href: instagramHref,
      logo: "/brands/instagram.svg",
    },
    {
      label: "YouTube",
      href: youtubeHref,
      logo: "/brands/youtube.svg",
    },
    {
      label: "Facebook",
      href: facebookHref,
      logo: "/brands/facebook.svg",
    },
  ];

  return (
    <aside
      aria-label="Redes sociais"
      className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {socialLinks.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className="grid size-10 place-items-center rounded-full bg-white shadow-md transition-all duration-300 hover:-translate-x-1 hover:scale-110 hover:shadow-lg"
        >
          <img src={item.logo} alt="" className="size-5" />
        </a>
      ))}
    </aside>
  );
}
