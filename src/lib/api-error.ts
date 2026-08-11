import { AxiosError } from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro inesperado. Tente novamente.",
) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; error?: string; detail?: string }
      | undefined;

    return data?.message || data?.detail || data?.error || fallback;
  }

  return fallback;
}
