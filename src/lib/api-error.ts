import { AxiosError } from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro inesperado. Tente novamente.",
) {
  if (error instanceof AxiosError) {
    if (error.response?.data) {
      const errObj = error as unknown as Record<string, unknown>;
      if (!errObj._logged) {
        console.error("Detalhes do Erro API:", error.response.data);
        errObj._logged = true;
      }
    }

    const data = error.response?.data as
      | { message?: string; error?: string; detail?: string }
      | undefined;

    return data?.message || data?.detail || data?.error || fallback;
  }

  return fallback;
}
