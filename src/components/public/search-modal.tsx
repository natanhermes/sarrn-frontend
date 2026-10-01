"use client";

import {
  CalendarDays,
  FileQuestion,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDateBR } from "@/lib/format";
import {
  getPublicPostCoverUrl,
  type PublicPost,
} from "@/lib/public-api";
import { cn } from "@/lib/utils";
import { parsePostsPage, type PostType } from "@/schemas/posts";

type SearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const typeBadgeConfig: Record<
  PostType,
  { label: string; className: string }
> = {
  NEWS: {
    label: "Notícia",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  PROJECT: {
    label: "Projeto",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  ARTICLE: {
    label: "Artigo",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  BOOKLET: {
    label: "Cartilha",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  EBOOK: {
    label: "E-book",
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  LIBRARY: {
    label: "Acervo",
    className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  },
  DOCUMENT: {
    label: "Documento",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
  REPORT: {
    label: "Relatório",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

function getPostHref(post: PublicPost): string {
  const slug = post.slug || post.id;
  if (post.type === "NEWS") return `/noticias/${slug}`;
  if (post.type === "PROJECT") return `/projetos/${slug}`;
  return `/publicacoes/${slug}`;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 350);

  const [results, setResults] = useState<PublicPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Foco no input ao abrir
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Busca na API pública conforme o usuário digita (com debounce)
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (trimmed.length < 2) {
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    const executeSearch = async () => {
      setIsLoading(true);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
        const params = new URLSearchParams({
          search: trimmed,
          q: trimmed,
          size: "10",
          sort: "publishedAt,desc",
        });

        const res = await fetch(`${baseUrl}/public/posts?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Erro na busca de publicações");
        }

        const data = await res.json();
        const parsed = parsePostsPage(data);

        if (!ignore) {
          setResults(parsed.content);
          setSelectedIndex(0);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError" && !ignore) {
          setResults([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    executeSearch();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [debouncedQuery]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearchQuery("");
      setResults([]);
      setSelectedIndex(0);
      setIsLoading(false);
    }
    onOpenChange(nextOpen);
  };

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setSelectedIndex(0);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleSelect = (post: PublicPost) => {
    handleOpenChange(false);
    router.push(getPostHref(post));
  };

  const isInitialState = searchQuery.trim().length < 2;
  const displayResults = isInitialState ? [] : results;
  const hasNoResults =
    !isInitialState && !isLoading && debouncedQuery.trim().length >= 2 && displayResults.length === 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleOpenChange(false);
      return;
    }

    if (displayResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev < displayResults.length - 1 ? prev + 1 : 0;
        scrollSelectedIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : displayResults.length - 1;
        scrollSelectedIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = displayResults[selectedIndex];
      if (current) {
        handleSelect(current);
      }
    }
  };

  const scrollSelectedIntoView = (index: number) => {
    if (!resultsContainerRef.current) return;
    const element = resultsContainerRef.current.children[index] as HTMLElement;
    if (element) {
      element.scrollIntoView({ block: "nearest" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl gap-0 overflow-hidden p-0 shadow-2xl border-border sm:max-w-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Buscar no portal</DialogTitle>
          <DialogDescription>
            Busque notícias, projetos, cartilhas e artigos no acervo do SAR.
          </DialogDescription>
        </DialogHeader>

        {/* Barra de Busca Superior */}
        <div className="relative flex items-center border-b border-border/80 px-4 py-3.5 bg-background">
          <Search className="size-5 shrink-0 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.trim().length < 2) {
                setResults([]);
                setIsLoading(false);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por título, resumo, objetivo ou conteúdo..."
            className="flex-1 bg-transparent text-base md:text-lg text-foreground placeholder:text-muted-foreground outline-none border-none ring-0 focus:ring-0 focus:outline-none"
            aria-label="Campo de busca geral"
          />

          <div className="flex items-center gap-1.5 ml-2">
            {isLoading && (
              <Loader2 className="size-4.5 animate-spin text-brand-green" />
            )}
            {searchQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Limpar texto"
              >
                <X className="size-4" />
              </button>
            ) : null}
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-90">
              ESC
            </kbd>
          </div>
        </div>

        {/* Conteúdo / Resultados */}
        <div
          ref={resultsContainerRef}
          className="max-h-[62vh] overflow-y-auto p-2 sm:p-3 divide-y divide-border/30"
          role="listbox"
          aria-label="Resultados da busca"
        >
          {/* Estado Inicial: menos de 2 caracteres */}
          {isInitialState && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-muted-foreground">
              <div className="rounded-full bg-brand-green/10 p-3 mb-3 text-brand-green">
                <Sparkles className="size-6" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Busca Geral do SAR
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Digite ao menos 2 caracteres para buscar notícias, projetos, cartilhas, artigos e documentos...
              </p>
            </div>
          )}

          {/* Estado de Carregamento inicial */}
          {isLoading && displayResults.length === 0 && (
            <div className="space-y-3 p-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 rounded-xl p-2 animate-pulse"
                >
                  <div className="size-16 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nenhum Resultado Encontrado */}
          {hasNoResults && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-muted-foreground">
              <div className="rounded-full bg-muted p-3 mb-3 text-muted-foreground">
                <FileQuestion className="size-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Nenhuma publicação encontrada
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Não encontramos resultados para &quot;{debouncedQuery}&quot;. Tente outros termos ou palavras-chave.
              </p>
            </div>
          )}

          {/* Lista de Resultados */}
          {displayResults.length > 0 &&
            displayResults.map((post, idx) => {
              const badge = typeBadgeConfig[post.type] ?? {
                label: post.type,
                className: "bg-muted text-muted-foreground",
              };
              const coverUrl = getPublicPostCoverUrl(post);
              const formattedDate = formatDateBR(
                post.publishedAt || post.createdAt,
              );
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={post.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(post)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3.5 rounded-xl p-2.5 transition-all",
                    isSelected
                      ? "bg-muted/80 text-foreground ring-1 ring-border"
                      : "hover:bg-muted/50 text-foreground",
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative size-16 sm:size-18 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/50">
                    <Image
                      src={coverUrl}
                      alt=""
                      width={72}
                      height={72}
                      unoptimized
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Informações Textuais */}
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[11px] font-semibold border",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </Badge>
                      {formattedDate && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <CalendarDays className="size-3" />
                          {formattedDate}
                        </span>
                      )}
                    </div>

                    <h4 className="mt-1 text-sm font-semibold tracking-tight text-foreground line-clamp-1 group-hover:text-brand-green transition-colors">
                      {post.title}
                    </h4>

                    {post.summary && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.summary}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Rodapé da Modal com Instruções de Atalho */}
        <div className="flex items-center justify-between border-t border-border/80 bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>{" "}
              para navegar
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              para abrir
            </span>
          </div>

          <div>
            {displayResults.length > 0 && (
              <span>
                {displayResults.length}{" "}
                {displayResults.length === 1 ? "resultado" : "resultados"}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
