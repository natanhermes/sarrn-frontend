"use client";

import { useState } from "react";
import { ExternalLink, Play, Share2 } from "lucide-react";
import Image from "next/image";

import { formatDateBR } from "@/lib/format";
import type { PublicSocialFeedItem } from "@/lib/public-api";
import { resolvePublicMediaUrl } from "@/lib/public-api";
import type { SocialPlatform } from "@/schemas/social-feed";

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

type SocialFeedSectionProps = {
  feed: PublicSocialFeedItem[];
};

type FilterTab = "ALL" | SocialPlatform;

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "Todos", value: "ALL" },
  { label: "YouTube", value: "YOUTUBE" },
  { label: "Instagram", value: "INSTAGRAM" },
  { label: "Facebook", value: "FACEBOOK" },
];

function getPlatformBadge(platform: SocialPlatform) {
  switch (platform) {
    case "YOUTUBE":
      return {
        label: "YouTube",
        icon: YoutubeIcon,
        bgClass: "bg-red-600/90 text-white",
        borderClass: "border-red-500/20",
      };
    case "INSTAGRAM":
      return {
        label: "Instagram",
        icon: InstagramIcon,
        bgClass: "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white",
        borderClass: "border-pink-500/20",
      };
    case "FACEBOOK":
      return {
        label: "Facebook",
        icon: FacebookIcon,
        bgClass: "bg-blue-600/90 text-white",
        borderClass: "border-blue-500/20",
      };
    default:
      return {
        label: "Social",
        icon: Share2,
        bgClass: "bg-muted text-muted-foreground",
        borderClass: "border-border",
      };
  }
}

export function SocialFeedSection({ feed }: SocialFeedSectionProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const filteredItems =
    activeTab === "ALL"
      ? feed
      : feed.filter((item) => item.platform === activeTab);


  if (feed.length === 0) {
    return null;
  }

  return (
    <section id="social-feed" className="px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <span className="text-lg font-semibold tracking-widest text-brand-green uppercase">
            Redes Sociais
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance leading-tight md:text-4xl">
            Acompanhe nossas Redes
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-pretty">
            Fique por dentro das nossas novidades, vídeos, projetos e ações comunitárias em tempo real.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-muted/40 p-1.5 backdrop-blur-xs">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                    ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="mt-12 text-center py-12 rounded-3xl border border-dashed border-border bg-card">
            <p className="text-sm text-muted-foreground">
              Nenhuma publicação encontrada para esta rede social no momento.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const badge = getPlatformBadge(item.platform);
              const PlatformIcon = badge.icon;
              const resolvedThumb =
                resolvePublicMediaUrl(item.thumbnailUrl) || "/placeholder.svg";

              return (
                <a
                  key={item.id}
                  href={item.postUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-black/5"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                    <img
                      src={resolvedThumb}
                      alt={item.title || "Publicação social"}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-xs ${badge.bgClass}`}
                      >
                        <PlatformIcon className="size-3" />
                        {badge.label}
                      </span>
                    </div>

                    {item.platform === "YOUTUBE" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px] transition-colors duration-300 group-hover:bg-black/35">
                        <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg text-red-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white">
                          <Play className="size-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-balance text-foreground group-hover:text-brand-green transition-colors">
                        {item.title || "Publicação nas redes sociais"}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted-foreground border-t border-border/60 pt-3">
                      <span>
                        {item.publishedAt ? formatDateBR(item.publishedAt) : "Recente"}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-green group-hover:underline">
                        Ver post
                        <ExternalLink className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
