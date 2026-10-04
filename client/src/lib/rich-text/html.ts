import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
];

function escapeText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function looksLikeHtml(value: string) {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function stripRichText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function isEmptyRichText(value: string | null | undefined) {
  return stripRichText(value ?? "").length === 0;
}

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "rel", "target"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  }).trim();
}

export function toRichHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (looksLikeHtml(trimmed)) {
    const html = sanitizeRichText(trimmed);
    return isEmptyRichText(html) ? "" : html;
  }
  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p>${escapeText(paragraph).replaceAll("\n", "<br />")}</p>`,
    )
    .join("");
  return sanitizeRichText(paragraphs);
}

export function normalizeRichText(value: string | null | undefined) {
  if (value == null) {
    return "";
  }
  const html = toRichHtml(value);
  return isEmptyRichText(html) ? "" : html;
}
