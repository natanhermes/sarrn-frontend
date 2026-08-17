import api from "@/lib/api";

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
] as const;

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export const VIDEO_ACCEPT = "video/mp4,.mp4,video/webm,.webm";

export const MEDIA_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,image/avif,.avif,image/svg+xml,.svg,video/mp4,.mp4,video/webm,.webm";

export const IMAGE_ACCEPT = MEDIA_ACCEPT;

export const GALLERY_MEDIA_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,image/avif,.avif,video/mp4,.mp4,video/webm,.webm";

export const GALLERY_IMAGE_ACCEPT = GALLERY_MEDIA_ACCEPT;

const PDF_MIME_TYPE = "application/pdf";
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB (104857600 bytes)
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export type UploadKind = "image" | "video" | "media" | "pdf";

type UploadResponse = {
  url?: string;
  fileUrl?: string;
  path?: string;
  data?: {
    url?: string;
    fileUrl?: string;
  };
};

export function isVideoFile(file: File): boolean {
  if (VIDEO_MIME_TYPES.includes(file.type as (typeof VIDEO_MIME_TYPES)[number])) {
    return true;
  }
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith(".mp4") || lowerName.endsWith(".webm");
}

export function isVideoUrl(url?: string | null): boolean {
  if (!url?.trim()) {
    return false;
  }
  const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
  return cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm");
}

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
  if (kind === "pdf") {
    if (file.type !== PDF_MIME_TYPE && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Formato inválido. Use PDF.");
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new Error("O PDF deve ter no máximo 20MB.");
    }
    return;
  }

  if (isVideoFile(file)) {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      throw new Error("O vídeo deve ter no máximo 100MB.");
    }
    return;
  }

  if (isAllowedImageFile(file)) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("A imagem deve ter no máximo 10MB.");
    }
    return;
  }

  throw new Error("Formato inválido. Use JPG, PNG, WEBP, AVIF, MP4 ou WEBM.");
}

export async function uploadMedia(
  file: File,
  kind: UploadKind = "media",
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
  return uploadMedia(file, "media", path);
}

export async function uploadVideo(file: File, path?: string) {
  return uploadMedia(file, "video", path);
}

export async function uploadPdf(file: File, path?: string) {
  return uploadMedia(file, "pdf", path);
}
