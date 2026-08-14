import api from "@/lib/api";

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
] as const;

export const IMAGE_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,image/avif,.avif,image/svg+xml,.svg";

export const GALLERY_IMAGE_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,image/avif,.avif";

const PDF_MIME_TYPE = "application/pdf";
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

type UploadKind = "image" | "pdf";

type UploadResponse = {
  url?: string;
  fileUrl?: string;
  path?: string;
  data?: {
    url?: string;
    fileUrl?: string;
  };
};

function extractUploadUrl(payload: UploadResponse | string) {
  if (typeof payload === "string") {
    return payload;
  }

  return (
    payload.url ||
    payload.fileUrl ||
    payload.path ||
    payload.data?.url ||
    payload.data?.fileUrl
  );
}

function isAllowedImageFile(file: File) {
  if (IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return (
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".webp") ||
    lowerName.endsWith(".avif") ||
    lowerName.endsWith(".svg")
  );
}

function assertValidFile(file: File, kind: UploadKind) {
  if (kind === "image") {
    if (!isAllowedImageFile(file)) {
      throw new Error("Formato inválido. Use JPG, PNG, WEBP ou AVIF.");
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("A imagem deve ter no máximo 10MB.");
    }

    return;
  }

  if (file.type !== PDF_MIME_TYPE) {
    throw new Error("Formato inválido. Use PDF.");
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("O PDF deve ter no máximo 20MB.");
  }
}

export async function uploadMedia(
  file: File,
  kind: UploadKind = "image",
  path?: string,
) {
  assertValidFile(file, kind);

  const formData = new FormData();
  formData.append("file", file);
  if (path) {
    formData.append("path", path);
  }

  const { data } = await api.post<UploadResponse>("/admin/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const url = extractUploadUrl(data);

  if (!url) {
    throw new Error("O servidor não retornou a URL do arquivo.");
  }

  return url;
}

export async function uploadImage(file: File, path?: string) {
  return uploadMedia(file, "image", path);
}

export async function uploadPdf(file: File, path?: string) {
  return uploadMedia(file, "pdf", path);
}
