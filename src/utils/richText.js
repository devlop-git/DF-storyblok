import { renderRichText } from "@storyblok/react/rsc";

// Storyblok equivalent of tiptapContentToHtml: richtext JSON -> HTML string.
// Returns "" for an empty editor (Storyblok stores one empty paragraph).
// Call it from server components and pass the string down to client ones.
export function richTextToHtml(doc) {
  if (!doc || typeof doc !== "object") return typeof doc === "string" ? doc : "";
  const html = renderRichText(doc) || "";
  return html.replace(/<[^>]*>/g, "").trim() ? html : "";
}
