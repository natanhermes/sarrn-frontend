import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) {
    return "";
  }

  const clean = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "video",
      "source",
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
      video: [
        "src",
        "controls",
        "preload",
        "playsinline",
        "controlslist",
        "width",
        "height",
        "title",
        "class",
        "style",
      ],
      source: ["src", "type"],
      iframe: ["src", "allowfullscreen", "frameborder", "allow", "title"],
      a: ["href", "name", "target", "rel"],
    },
    allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
  });

  return clean.replace(/&nbsp;/gi, " ").replace(/\u00A0/g, " ");
}

export function isRichTextEmpty(html: string) {
  if (/<(img|video)\b/i.test(html)) {
    return false;
  }

  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

  return text.length === 0;
}
