import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "h1",
  "h2",
  "h3",
  "span",
  "blockquote",
];

const ALLOWED_ATTR = ["href", "target", "rel", "class", "src", "alt", "title"];

export function sanitizeRichText(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onclick", "onload", "style"],
  });

  return clean.replace(/&nbsp;/gi, " ").replace(/\u00A0/g, " ");
}

export function isRichTextEmpty(html: string) {
  if (/<img\b/i.test(html)) {
    return false;
  }

  const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length === 0;
}
