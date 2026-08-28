"use client";

import { Check, Copy, Heart, QrCode, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatCnpj, formatPixKeyDisplay } from "@/lib/format";
import type { PublicSiteSettings } from "@/lib/public-api";

import logoBB from "../../../public/images/logo-BB.png";
import logoPix from "../../../public/images/icon-pix.png";

type DonatePageContentProps = {
  settings: PublicSiteSettings | null;
};

const WHATSAPP_MESSAGE = "Olá! Gostaria de obter mais informações sobre como fazer uma doação para o SAR.";

function toWhatsAppHref(whatsapp?: string) {
  const digits = (whatsapp ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

export function DonatePageContent({ settings }: DonatePageContentProps) {
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedPixKey, setCopiedPixKey] = useState(false);
  const [copiedSecondaryPixKey, setCopiedSecondaryPixKey] = useState(false);
  const [copiedCnpj, setCopiedCnpj] = useState(false);

  const donationPixPayload = settings?.donationPixPayload?.trim() || "";
  const pixReceiverName = settings?.pixReceiverName?.trim() || "";
  const pixKey = settings?.pixKey?.trim() || "";
  const pixKeyTypeLabel = settings?.pixKeyType?.trim().toUpperCase() || "CHAVE PRINCIPAL";
  const pixKeyDisplay = formatPixKeyDisplay(pixKey, settings?.pixKeyType);

  const pixKeySecondary = settings?.pixKeySecondary?.trim() || "";
  const pixKeySecondaryTypeLabel = settings?.pixKeySecondaryType?.trim().toUpperCase() || "CHAVE SECUNDÁRIA";
  const pixKeySecondaryDisplay = formatPixKeyDisplay(pixKeySecondary, settings?.pixKeySecondaryType);

  const bankName = settings?.bankName?.trim() || "";
  const bankAgency = settings?.bankAgency?.trim() || "";
  const bankAccount = settings?.bankAccount?.trim() || "";
  const documentCnpj = settings?.documentCnpj?.trim() || "";
  const documentCnpjDisplay = formatCnpj(documentCnpj) || documentCnpj;

  const whatsappHref = toWhatsAppHref(settings?.whatsappNumber);

  async function handleCopyPayload() {
    if (!donationPixPayload) return;
    try {
      await navigator.clipboard.writeText(donationPixPayload);
      setCopiedPayload(true);
      toast.success("Código Pix Copia e Cola copiado!");
      setTimeout(() => setCopiedPayload(false), 2500);
    } catch {
      toast.error("Não foi possível copiar o código.");
    }
  }

  async function handleCopyPixKey() {
    if (!pixKey) return;
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiedPixKey(true);
      toast.success("Chave Pix copiada!");
      setTimeout(() => setCopiedPixKey(false), 2500);
    } catch {
      toast.error("Não foi possível copiar a chave.");
    }
  }

  async function handleCopySecondaryPixKey() {
    if (!pixKeySecondary) return;
    try {
      await navigator.clipboard.writeText(pixKeySecondary);
      setCopiedSecondaryPixKey(true);
      toast.success("Chave Pix secundária copiada!");
      setTimeout(() => setCopiedSecondaryPixKey(false), 2500);
    } catch {
      toast.error("Não foi possível copiar a chave.");
    }
  }

  async function handleCopyCnpj() {
    if (!documentCnpj) return;
    try {
      await navigator.clipboard.writeText(documentCnpj);
      setCopiedCnpj(true);
      toast.success("CNPJ copiado!");
      setTimeout(() => setCopiedCnpj(false), 2500);
    } catch {
      toast.error("Não foi possível copiar o CNPJ.");
    }
  }

  const hasPix = Boolean(donationPixPayload || pixKey || pixKeySecondary || pixReceiverName);
  const hasBank = Boolean(bankName || bankAgency || bankAccount || documentCnpj);

  return (
    <div className="min-h-screen bg-slate-50/50 py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Header section */}
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold text-orange-700 md:text-sm">
            <Heart className="size-4 fill-orange-500 text-orange-500" />
            <span>Faça a Diferença</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Apoie o SAR
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
            Sua doação fortalece a agricultura familiar, a agroecologia e garante a continuidade de projetos de autonomia e renda no Rio Grande do Norte.
          </p>
        </div>

        {/* Main Content Container */}
        <div className={`mt-6 w-full ${hasPix && hasBank ? "grid gap-8 md:grid-cols-2 text-left" : "flex flex-col items-center max-w-lg mx-auto text-left"}`}>
          {/* PIX Donation Card */}
          {hasPix && (
            <div className="flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 w-full">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#77B6A8]/15">
                  <Image
                    src={logoPix}
                    alt="Pix"
                    width={32}
                    height={32}
                    className="size-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Doação via Pix</h2>
                  <p className="text-xs text-slate-500">Rápido, seguro e instantâneo</p>
                </div>
              </div>

              {/* QR Code Section (Hidden on mobile, visible on desktop md:flex) */}
              {donationPixPayload ? (
                <div className="mt-6 w-full flex flex-col items-center rounded-2xl bg-slate-50 border border-slate-100 p-6">
                  <div className="hidden md:flex flex-col items-center gap-3">
                    <div className="rounded-xl bg-white p-4 shadow-xs border border-slate-200">
                      <QRCode value={donationPixPayload} size={180} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <QrCode className="size-3.5 text-slate-400" />
                      Escaneie com o app do seu banco
                    </span>
                  </div>

                  {/* Copy Pix Payload Button (Primary for both mobile & desktop) */}
                  <div className="w-full mt-4 md:mt-6">
                    <Button
                      type="button"
                      onClick={handleCopyPayload}
                      size="lg"
                      className="w-full bg-orange-500 text-white font-semibold hover:bg-orange-600 shadow-sm"
                    >
                      {copiedPayload ? (
                        <>
                          <Check className="size-5 text-white" />
                          <span>Código Pix Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-5" />
                          <span>Copiar código Pix (Copia e Cola)</span>
                        </>
                      )}
                    </Button>
                    <p className="mt-2 text-center text-xs text-slate-500">
                      Ideal para doar usando o celular (Pix Copia e Cola)
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Pix Keys & Receiver Details */}
              <div className="mt-6 w-full space-y-4 divide-y divide-slate-100 text-sm">
                {pixReceiverName ? (
                  <div className="pt-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Favorecido / Recebedor
                    </span>
                    <p className="mt-0.5 font-semibold text-slate-800">{pixReceiverName}</p>
                  </div>
                ) : null}

                {pixKey ? (
                  <div className="pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {pixKeyTypeLabel}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyPixKey}
                        className="h-7 gap-1 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        {copiedPixKey ? (
                          <>
                            <Check className="size-3.5" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copiar Chave</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-slate-800 break-all">
                      {pixKeyDisplay}
                    </p>
                  </div>
                ) : null}

                {pixKeySecondary ? (
                  <div className="pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {pixKeySecondaryTypeLabel}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopySecondaryPixKey}
                        className="h-7 gap-1 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        {copiedSecondaryPixKey ? (
                          <>
                            <Check className="size-3.5" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copiar Chave</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-slate-800 break-all">
                      {pixKeySecondaryDisplay}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Bank Transfer Card */}
          {hasBank && (
            <div className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 w-full">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-yellow-500/10">
                  <Image
                    src={logoBB}
                    alt="Banco do Brasil"
                    width={32}
                    height={32}
                    className="size-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Transferência Bancária</h2>
                  <p className="text-xs text-slate-500">Depósito ou TED/DOC</p>
                </div>
              </div>

              <div className="mt-6 flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-6 space-y-4 text-sm">
                {bankName ? (
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Banco
                    </span>
                    <p className="mt-0.5 font-semibold text-slate-800">{bankName}</p>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-4">
                  {bankAgency ? (
                    <div>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Agência
                      </span>
                      <p className="mt-0.5 font-mono font-semibold text-slate-800">{bankAgency}</p>
                    </div>
                  ) : null}

                  {bankAccount ? (
                    <div>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Conta Corrente
                      </span>
                      <p className="mt-0.5 font-mono font-semibold text-slate-800">{bankAccount}</p>
                    </div>
                  ) : null}
                </div>

                {documentCnpj ? (
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        CNPJ
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyCnpj}
                        className="h-7 gap-1 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        {copiedCnpj ? (
                          <>
                            <Check className="size-3.5" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copiar CNPJ</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="mt-0.5 font-mono font-semibold text-slate-800 break-all">
                      {documentCnpjDisplay}
                    </p>
                  </div>
                ) : null}
              </div>

              {whatsappHref && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 gap-2 text-slate-700 hover:bg-slate-50"
                    nativeButton={false}
                    render={
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" />
                    }
                  >
                    <MessageCircle className="size-4 text-emerald-600" />
                    <span>Dúvidas? Fale com a equipe no WhatsApp</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
