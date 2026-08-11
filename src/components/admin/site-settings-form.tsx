"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  siteSettingsFormSchema,
  toSiteSettingsSubmitPayload,
  type SiteSettingsFormValues,
  type SiteSettingsSubmitPayload,
} from "@/schemas/settings";

type SiteSettingsFormProps = {
  defaultValues?: Partial<SiteSettingsFormValues>;
  onSubmit: (values: SiteSettingsSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

function toPhoneMaskDigits(value?: string) {
  let digits = (value ?? "").replace(/\D/g, "");

  if (digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  return digits;
}

export function SiteSettingsForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: SiteSettingsFormProps) {
  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
      siteTitle: defaultValues?.siteTitle ?? "",
      metaDescription: defaultValues?.metaDescription ?? "",
      locationText: defaultValues?.locationText ?? "",
      phoneNumber: defaultValues?.phoneNumber ?? "",
      whatsappNumber: defaultValues?.whatsappNumber ?? "",
      googleMapsUrl: defaultValues?.googleMapsUrl ?? "",
      instagramUrl: defaultValues?.instagramUrl ?? "",
      facebookUrl: defaultValues?.facebookUrl ?? "",
      youtubeUrl: defaultValues?.youtubeUrl ?? "",
      pixKey: defaultValues?.pixKey ?? "",
      pixKeyType: defaultValues?.pixKeyType ?? "",
      pixReceiverName: defaultValues?.pixReceiverName ?? "",
      pixKeySecondary: defaultValues?.pixKeySecondary ?? "",
      pixKeySecondaryType: defaultValues?.pixKeySecondaryType ?? "",
      bankName: defaultValues?.bankName ?? "",
      bankAgency: defaultValues?.bankAgency ?? "",
      bankAccount: defaultValues?.bankAccount ?? "",
      documentCnpj: defaultValues?.documentCnpj ?? "",
    },
  });

  async function handleSubmit(values: SiteSettingsFormValues) {
    await onSubmit(toSiteSettingsSubmitPayload(values));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 sm:w-fit">
          <TabsTrigger value="geral">Geral & SEO</TabsTrigger>
          <TabsTrigger value="localizacao">Localização e Contato</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
          <TabsTrigger value="doacoes">Doações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-6">
          <FieldGroup>
            <Controller
              control={form.control}
              name="siteTitle"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-site-title">
                    Título do Site
                  </FieldLabel>
                  <Input
                    id="settings-site-title"
                    placeholder="SARRN — Semeando Autonomia e Renda"
                    disabled={isSubmitting}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="metaDescription"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-meta-description">
                    Meta-descrição
                  </FieldLabel>
                  <Textarea
                    id="settings-meta-description"
                    placeholder="Descrição usada em buscas e compartilhamentos"
                    rows={4}
                    disabled={isSubmitting}
                    {...field}
                  />
                  <FieldDescription>
                    Recomendado até 160 caracteres para SEO.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="localizacao" className="mt-6">
          <FieldGroup>
            <Controller
              control={form.control}
              name="locationText"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-location-text">
                    Texto de Localização
                  </FieldLabel>
                  <Textarea
                    id="settings-location-text"
                    placeholder="Rua Exemplo, 123 — Natal/RN"
                    rows={4}
                    disabled={isSubmitting}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-phone-number">
                    Telefone Principal (Ligação)
                  </FieldLabel>
                  <PatternFormat
                    id="settings-phone-number"
                    customInput={Input}
                    format="+55(##)####-####"
                    mask="_"
                    valueIsNumericString
                    value={toPhoneMaskDigits(field.value)}
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                    onBlur={field.onBlur}
                    getInputRef={field.ref}
                    placeholder="+55(84)3333-3333"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="whatsappNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-whatsapp">WhatsApp</FieldLabel>
                  <PatternFormat
                    id="settings-whatsapp"
                    customInput={Input}
                    format="+55(##)#####-####"
                    mask="_"
                    valueIsNumericString
                    value={toPhoneMaskDigits(field.value)}
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                    onBlur={field.onBlur}
                    getInputRef={field.ref}
                    placeholder="+55(84)99999-9999"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="googleMapsUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-google-maps">
                    URL do Google Maps
                  </FieldLabel>
                  <Input
                    id="settings-google-maps"
                    placeholder="https://maps.google.com/..."
                    disabled={isSubmitting}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="redes" className="mt-6">
          <FieldGroup>
            <Controller
              control={form.control}
              name="instagramUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-instagram">Instagram</FieldLabel>
                  <Input
                    id="settings-instagram"
                    placeholder="https://instagram.com/..."
                    disabled={isSubmitting}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="facebookUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-facebook">Facebook</FieldLabel>
                  <Input
                    id="settings-facebook"
                    placeholder="https://facebook.com/..."
                    disabled={isSubmitting}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="youtubeUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-youtube">YouTube</FieldLabel>
                  <Input
                    id="settings-youtube"
                    placeholder="https://youtube.com/..."
                    disabled={isSubmitting}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </TabsContent>

        <TabsContent value="doacoes" className="mt-6 space-y-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">PIX</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Dados exibidos no card de doação via PIX.
              </p>
            </div>
            <FieldGroup>
              <Controller
                control={form.control}
                name="pixReceiverName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="settings-pix-receiver">
                      Nome do Recebedor
                    </FieldLabel>
                    <Input
                      id="settings-pix-receiver"
                      placeholder="SARRN"
                      disabled={isSubmitting}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="pixKeyType"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="settings-pix-key-type">
                        Tipo da Chave Principal
                      </FieldLabel>
                      <Input
                        id="settings-pix-key-type"
                        placeholder="CNPJ, E-mail, Telefone..."
                        disabled={isSubmitting}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="pixKey"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="settings-pix-key">
                        Chave PIX Principal
                      </FieldLabel>
                      <Input
                        id="settings-pix-key"
                        placeholder="email@exemplo.org ou CNPJ"
                        disabled={isSubmitting}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="pixKeySecondaryType"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="settings-pix-key-secondary-type">
                        Tipo da Chave Secundária
                      </FieldLabel>
                      <Input
                        id="settings-pix-key-secondary-type"
                        placeholder="CNPJ, E-mail, Telefone..."
                        disabled={isSubmitting}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="pixKeySecondary"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="settings-pix-key-secondary">
                        Chave PIX Secundária
                      </FieldLabel>
                      <Input
                        id="settings-pix-key-secondary"
                        placeholder="Outra chave PIX (opcional)"
                        disabled={isSubmitting}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </div>

          <div className="space-y-4 border-t border-border pt-8">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                Conta Bancária
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Dados exibidos no card de transferência bancária.
              </p>
            </div>
            <FieldGroup>
              <Controller
                control={form.control}
                name="bankName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="settings-bank-name">Banco</FieldLabel>
                    <Input
                      id="settings-bank-name"
                      placeholder="Nome do banco"
                      disabled={isSubmitting}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="bankAgency"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="settings-bank-agency">
                        Agência
                      </FieldLabel>
                      <Input
                        id="settings-bank-agency"
                        placeholder="0001"
                        disabled={isSubmitting}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="bankAccount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="settings-bank-account">
                        Conta
                      </FieldLabel>
                      <Input
                        id="settings-bank-account"
                        placeholder="12345-6"
                        disabled={isSubmitting}
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="documentCnpj"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="settings-document-cnpj">
                      CNPJ
                    </FieldLabel>
                    <Input
                      id="settings-document-cnpj"
                      placeholder="00.000.000/0000-00"
                      disabled={isSubmitting}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar configurações"
          )}
        </Button>
      </div>
    </form>
  );
}
