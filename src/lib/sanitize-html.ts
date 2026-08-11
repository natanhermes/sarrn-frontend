import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) {
    return "";
  }

  const clean = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "iframe",
      "h1",
      "h2",
      "u",
      "s",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class", "id"],
      img: ["src", "alt", "width", "height", "title"],
      iframe: ["src", "allowfullscreen", "frameborder", "allow", "title"],
      a: ["href", "name", "target", "rel"],
    },
    allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
  });

  return clean.replace(/&nbsp;/gi, " ").replace(/\u00A0/g, " ");
}

export function isRichTextEmpty(html: string) {
  if (/<img\b/i.test(html)) {
    return false;
  }

  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

  return text.length === 0;
}
