"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useRequireEditor } from "@/hooks/use-require-editor";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCnpj, formatDateBR } from "@/lib/format";
import { parsePartnersList, type Partner } from "@/schemas/partners";

function PartnersPageContent() {
  const { shouldRender, isChecking } = useRequireEditor();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  const initialSearch =
    searchParams.get("search") ?? searchParams.get("q") ?? "";
  const [prevSearch, setPrevSearch] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  if (prevSearch !== initialSearch) {
    setPrevSearch(initialSearch);
    setSearchQuery(initialSearch);
  }

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    const currentParam =
      searchParams.get("search") ?? searchParams.get("q") ?? "";

    if (!searchQuery.trim()) {
      if (currentParam.trim()) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("search");
        params.delete("q");
        const query = params.toString();
        router.replace(query ? `?${query}` : "?", { scroll: false });
      }
      return;
    }

    if (debouncedSearch.trim() !== currentParam.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("search", debouncedSearch.trim());
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    }
  }, [debouncedSearch, searchQuery, router, searchParams]);

  const partnersQuery = useQuery({
    queryKey: ["admin-partners"],
    enabled: shouldRender,
    queryFn: async () => {
      const { data } = await api.get("/admin/partners");
      return parsePartnersList(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      await api.delete(`/admin/partners/${partnerId}`);
      return partnerId;
    },
    onSuccess: async (deletedId) => {
      queryClient.setQueryData<Partner[]>(["admin-partners"], (old) =>
        old ? old.filter((p) => p.id !== deletedId) : [],
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      toast.success("Parceiro excluído com sucesso");
      setPartnerToDelete(null);
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Não foi possível excluir o parceiro."),
      );
    },
  });

  if (isChecking) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando...
      </main>
    );
  }

  if (!shouldRender) {
    return null;
  }

  const partners = partnersQuery.data ?? [];
  const sortedPartners = [...partners].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const activeSearch = (
    searchParams.get("search") ??
    searchParams.get("q") ??
    searchQuery
  )
    .trim()
    .toLowerCase();
  const searchDigits = activeSearch.replace(/\D/g, "");

  const filteredPartners = sortedPartners.filter((partner) => {
    if (!activeSearch) return true;

    const nameMatch = partner.name.toLowerCase().includes(activeSearch);

    const partnerCnpjDigits = partner.cnpj
      ? partner.cnpj.replace(/\D/g, "")
      : "";
    const cnpjMatch = partner.cnpj
      ? partner.cnpj.toLowerCase().includes(activeSearch) ||
        (searchDigits.length > 0 && partnerCnpjDigits.includes(searchDigits))
      : false;

    return nameMatch || cnpjMatch;
  });

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Parceiros</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as logos exibidas na seção de parceiros da Home.
          </p>
        </div>

        <Link href="/dashboard/partners/create">
          <Button type="button">
            <PlusIcon />
            Novo parceiro
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nome ou CNPJ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {partnersQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Carregando parceiros...
        </div>
      ) : partnersQuery.isError ? (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(
            partnersQuery.error,
            "Não foi possível carregar os parceiros.",
          )}
        </p>
      ) : partners.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum parceiro cadastrado. Adicione o primeiro parceiro da Home.
        </p>
      ) : filteredPartners.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum parceiro encontrado para a busca.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-22">Logo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-44">CNPJ</TableHead>
                <TableHead className="w-25">Ordem</TableHead>
                <TableHead className="w-30">Ativo</TableHead>
                <TableHead className="w-32">Criado em</TableHead>
                <TableHead className="w-30 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <img
                      src={partner.logoUrl || "/placeholder.svg"}
                      alt=""
                      className="size-14 rounded-md object-contain bg-muted/40 p-1"
                    />
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">
                    <span className="line-clamp-2">{partner.name}</span>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">
                    {formatCnpj(partner.cnpj) || "—"}
                  </TableCell>
                  <TableCell>{partner.displayOrder}</TableCell>
                  <TableCell>
                    <Badge variant={partner.isActive ? "default" : "secondary"}>
                      {partner.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDateBR(partner.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/partners/${partner.id}/edit`}>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Editar parceiro"
                        >
                          <PencilIcon />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Excluir parceiro"
                        onClick={() => setPartnerToDelete(partner)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(partnerToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPartnerToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir parceiro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente
              {partnerToDelete?.name ? ` "${partnerToDelete.name}"` : ""} da
              listagem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (partnerToDelete) {
                  deleteMutation.mutate(partnerToDelete.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

export default function PartnersPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Carregando...
        </main>
      }
    >
      <PartnersPageContent />
    </Suspense>
  );
}
