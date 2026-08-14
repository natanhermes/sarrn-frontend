import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEmptyRichText(html: string | null | undefined): boolean {
  if (!html) {
    return true;
  }

  if (/<(img|iframe|video|audio|svg)\b/i.test(html)) {
    return false;
  }

  const textWithoutTags = html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00A0/g, " ");

  return textWithoutTags.trim().length === 0;
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  return isEmptyRichText(html);
}

export function hasValidBlocks(
  blocks?: Array<{
    type: string;
    content?: string | null;
    galleryUrls?: string[] | null;
    fileUrl?: string | null;
  }> | null,
): boolean {
  if (!blocks || blocks.length === 0) {
    return false;
  }

  return blocks.some((block) => {
    if (block.type === "TEXT") {
      return !isEmptyRichText(block.content);
    }
    if (block.type === "GALLERY") {
      return Boolean(block.galleryUrls && block.galleryUrls.length > 0);
    }
    if (block.type === "FILE") {
      return Boolean(block.fileUrl && block.fileUrl.trim());
    }
    return false;
  });
}
