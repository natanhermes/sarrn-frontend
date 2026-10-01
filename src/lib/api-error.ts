import { AxiosError } from "axios";

interface ProblemDetail {
  title?: string;
  status?: number;
  detail?: string;
  message?: string;
  error?: string;
}

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

    if (
      typeof error.response?.data === "string" &&
      error.response.data.trim().length > 0
    ) {
      return error.response.data;
    }

    const data = error.response?.data as ProblemDetail | undefined;
    const status = error.response?.status;

    if (
      data?.detail &&
      typeof data.detail === "string" &&
      data.detail.trim().length > 0
    ) {
      return data.detail;
    }

    if (
      data?.message &&
      typeof data.message === "string" &&
      data.message.trim().length > 0
    ) {
      return data.message;
    }

    if (
      data?.error &&
      typeof data.error === "string" &&
      data.error.trim().length > 0
    ) {
      return data.error;
    }

    if (
      data?.title &&
      typeof data.title === "string" &&
      data.title.trim().length > 0
    ) {
      return data.title;
    }

    if (status === 422) {
      return "Não foi possível processar a solicitação com os dados fornecidos.";
    }

    if (status === 409) {
      return "Já existe um registro com as informações fornecidas.";
    }

    if (status === 403) {
      return "Você não tem permissão para realizar esta ação.";
    }

    return fallback;
  }

  return fallback;
}

