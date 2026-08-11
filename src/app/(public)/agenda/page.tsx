import type { Metadata } from "next";

import { AgendaCatalog } from "@/components/public/agenda-catalog";
import type { AgendaView } from "@/components/public/agenda-filter";
import { resolveCatalogPage } from "@/lib/catalog-filters";
import { getPublicEventsPage } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Agenda — SARRN",
  description:
    "Acompanhe os próximos eventos, encontros e atividades da SARRN no semiárido potiguar.",
};

const PAGE_SIZE = 10;

type AgendaPageProps = {
  searchParams: Promise<{
    view?: string;
    scope?: string;
    year?: string;
    month?: string;
    page?: string;
  }>;
};

function resolveView(viewParam?: string, scopeParam?: string): AgendaView {
  const value = viewParam || scopeParam;

  if (value === "past") {
    return "past";
  }

  return "upcoming";
}

function resolveMonth(monthParam?: string) {
  const month = Number(monthParam);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return undefined;
  }

  return month;
}

function resolveYear(yearParam?: string) {
  const year = Number(yearParam);
  const currentYear = new Date().getFullYear();

  if (!Number.isInteger(year) || year < currentYear - 4 || year > currentYear + 1) {
    return undefined;
  }

  return year;
}

function currentMonthParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const view = resolveView(params.view, params.scope);
  const pageOneBased = resolveCatalogPage(params.page);
  let year = resolveYear(params.year);
  let month = resolveMonth(params.month);

  if (view === "past") {
    const fallback = currentMonthParts();
    year = year ?? fallback.year;
    month = month ?? fallback.month;
  }

  const pageData = await getPublicEventsPage({
    upcoming: view === "upcoming" ? true : undefined,
    year: view === "past" ? year : undefined,
    month: view === "past" ? month : undefined,
    page: pageOneBased - 1,
    size: PAGE_SIZE,
  });

  return (
    <main className="min-w-0 overflow-x-hidden pb-20">
      <section className="bg-[#356e7c] pt-28 pb-12 text-white md:pt-32 md:pb-16">
        <div className="mx-auto w-full max-w-4xl px-5 md:px-8">
          <p className="text-sm font-semibold tracking-widest text-white/70 uppercase">
            Agenda
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            Eventos e encontros
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/80">
            Confira as atividades da SARRN e explore os detalhes de cada
            evento.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-8">
        <AgendaCatalog
          pageData={pageData}
          view={view}
          year={year}
          month={month}
        />
      </div>
    </main>
  );
}
