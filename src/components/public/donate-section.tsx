"use client";

import { Check, Copy } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SarrnLogo } from "@/components/public/sarrn-logo";
import {
  formatCnpj,
  formatPixKeyDisplay,
} from "@/lib/format";
import type { PublicSiteSettings } from "@/lib/public-api";

import logoBB from "../../../public/images/logo-BB.png";
import logoPix from "../../../public/images/icon-pix.png";

type DonateSectionProps = {
  settings: PublicSiteSettings | null;
};

const WHATSAPP_MESSAGE =
  "Olá, sejam vindos(as)! Em que podemos ajudar?";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      onClick={handleCopy}
      className="shrink-0"
    >
      {copied ? (
        <Check className="size-4 text-brand-green" />
      ) : (
        <Copy className="size-4" />
      )}
    </Button>
  );
}

function toWhatsAppHref(whatsapp?: string) {
  const digits = (whatsapp ?? "").replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const text = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${withCountry}?text=${text}`;
}

export function DonateSection({ settings }: DonateSectionProps) {
  if (!settings) {
    return null;
  }

  const pixReceiverName = settings.pixReceiverName?.trim() || "";
  const pixKey = settings.pixKey?.trim() || "";
  const pixKeyTypeLabel =
    settings.pixKeyType?.trim().toUpperCase() || "CHAVE PRINCIPAL";
  const pixKeyDisplay = formatPixKeyDisplay(pixKey, settings.pixKeyType);
  const pixKeySecondary = settings.pixKeySecondary?.trim() || "";
  const pixKeySecondaryTypeLabel =
    settings.pixKeySecondaryType?.trim().toUpperCase() || "CHAVE SECUNDÁRIA";
  const pixKeySecondaryDisplay = formatPixKeyDisplay(
    pixKeySecondary,
    settings.pixKeySecondaryType,
  );
  const bankName = settings.bankName?.trim() || "";
  const bankAgency = settings.bankAgency?.trim() || "";
  const bankAccount = settings.bankAccount?.trim() || "";
  const documentCnpj = settings.documentCnpj?.trim() || "";
  const documentCnpjDisplay = formatCnpj(documentCnpj) || documentCnpj;
  const whatsappHref = toWhatsAppHref(settings.whatsappNumber);

  const hasPix = Boolean(pixKey || pixKeySecondary || pixReceiverName);
  const hasBank = Boolean(
    bankName || bankAgency || bankAccount || documentCnpj,
  );

  if (!hasPix && !hasBank && !whatsappHref) {
    return null;
  }

  return (
    <section id="doacoes" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center text-white md:p-16">
        <h2 className="mb-4 text-3xl font-bold text-balance text-white md:text-4xl">
          Sua doação vira cisterna, semente e formação
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-base text-slate-300 md:text-lg">
          Contribuições mensais sustentam a assessoria técnica direta às famílias
          e a produção gratuita de cartilhas pedagógicas.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {hasPix || hasBank ? (
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    size="lg"
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  />
                }
              >
                Quero apoiar o SAR
              </DialogTrigger>

              <DialogContent className="max-h-[85vh] gap-8 overflow-y-auto p-6 sm:max-w-2xl sm:p-8">
                <DialogHeader className="gap-3">
                  <DialogTitle className="text-lg font-bold md:text-xl">
                    Escolha como deseja apoiar
                  </DialogTitle>
                </DialogHeader>

                <div
                  className={
                    hasPix && hasBank
                      ? "grid gap-8 sm:grid-cols-2"
                      : "grid gap-8"
                  }
                >
                  {hasPix ? (
                    <article className="flex flex-col rounded-2xl border border-border bg-muted/30 p-6">
                      <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#77B6A8]/15">
                        <Image
                          src={logoPix}
                          alt="PIX"
                          width={28}
                          height={28}
                          className="size-7 object-contain"
                        />
                      </div>
                      <h3 className="text-base font-bold tracking-tight">
                        Chaves PIX
                      </h3>
                      {pixReceiverName ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Recebedor:{" "}
                          <span className="font-medium text-foreground">
                            {pixReceiverName}
                          </span>
                        </p>
                      ) : null}

                      <div className="mt-4">
                        {pixKey ? (
                          <div>
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                              {pixKeyTypeLabel}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <p className="min-w-0 flex-1 break-all font-semibold">
                                {pixKeyDisplay}
                              </p>
                              <CopyButton
                                value={pixKey}
                                label={pixKeyTypeLabel}
                              />
                            </div>
                          </div>
                        ) : null}

                        {pixKeySecondary ? (
                          <>
                            <hr className="my-4 border-slate-100" />
                            <div>
                              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                {pixKeySecondaryTypeLabel}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <p className="min-w-0 flex-1 break-all font-semibold">
                                  {pixKeySecondaryDisplay}
                                </p>
                                <CopyButton
                                  value={pixKeySecondary}
                                  label={pixKeySecondaryTypeLabel}
                                />
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </article>
                  ) : null}

                  {hasBank ? (
                    <article className="flex flex-col rounded-2xl border border-border bg-muted/30 p-6">
                      <div className="mb-5 flex size-12 items-center justify-center overflow-hidden rounded-xl">
                        <Image
                          src={logoBB}
                          alt="Banco do Brasil"
                          width={48}
                          height={48}
                          className="size-12 object-contain"
                        />
                      </div>
                      <h3 className="text-base font-bold tracking-tight">
                        Conta Bancária
                      </h3>

                      <dl className="mt-5 space-y-4 text-sm">
                        {bankName ? (
                          <div>
                            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                              Banco
                            </dt>
                            <dd className="mt-1 font-semibold">{bankName}</dd>
                          </div>
                        ) : null}

                        {bankAgency || bankAccount ? (
                          <div className="grid grid-cols-2 gap-3">
                            {bankAgency ? (
                              <div>
                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                  Agência
                                </dt>
                                <dd className="mt-1 font-semibold">
                                  {bankAgency}
                                </dd>
                              </div>
                            ) : null}

                            {bankAccount ? (
                              <div>
                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                  Conta
                                </dt>
                                <dd className="mt-1 font-semibold">
                                  {bankAccount}
                                </dd>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {documentCnpj ? (
                          <div>
                            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                              CNPJ
                            </dt>
                            <dd className="mt-1 flex items-center gap-2">
                              <span className="min-w-0 flex-1 break-all font-semibold">
                                {documentCnpjDisplay}
                              </span>
                              <CopyButton
                                value={documentCnpjDisplay}
                                label="CNPJ"
                              />
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </article>
                  ) : null}
                </div>
              </DialogContent>
            </Dialog>
          ) : null}

          {whatsappHref ? (
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white [a]:hover:bg-slate-800"
              nativeButton={false}
              render={
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Falar com a equipe
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
