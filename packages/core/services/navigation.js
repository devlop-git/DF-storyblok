import { storyblokEditable } from "@storyblok/react/rsc";

import { fetchStory } from "@df/core/lib/storyblok";
import { getNavigation } from "@df/core/services/commerce";
import { categoryName, slugify } from "@df/core/utils/slugify";

// The header menu. Business users manage it in Storyblok: the "Main
// Navigation" story (content type `navigation`, slug main-navigation) holds
// nav_item -> nav_column -> nav_link blocks. Without that story in the brand's
// space (or if Storyblok fails) the menu comes from the PIM category API as before.
//
// Both sources are normalised to:
//   [{ id, label, href, editable, columns: [{ id, heading, editable, links: [{ id, label, href, editable }] }] }]
// `editable`: Visual Editor attributes to spread on the element ({} for PIM items).
const MENU_SLUG = "main-navigation";

// Storyblok multilink -> URL ("" when empty).
function linkHref(link) {
  if (!link) return "";
  if (link.linktype === "email") return link.email ? `mailto:${link.email}` : "";
  const url = link.linktype === "story" ? link.cached_url : link.url || link.cached_url;
  if (!url) return "";
  return /^(https?:|mailto:|tel:|#)/.test(url) ? url : `/${url.replace(/^\/+/, "")}`;
}

// Hidden for now? Every menu level has a "Hide" switch and optional "Show from"
// / "Show until" dates (Storyblok datetime, UTC "2026-11-02 09:00"), so a menu
// can be taken out for a while without deleting it.
function isVisible(block, now = Date.now()) {
  if (block.hide) return false;
  const time = (value) => (value ? Date.parse(`${value.replace(" ", "T")}Z`) : NaN);
  if (time(block.show_from) > now) return false;
  if (time(block.show_until) <= now) return false;
  return true;
}

// Sub-menu URL: the Link field if set, else built from the names exactly like
// the PIM menu: "Engagement Rings" + "Solitaire" -> /engagement-rings/solitaire.
// `url_name` keeps the URL stable when the label is renamed or translated.
function fromStoryblok(story) {
  return (story.content.items ?? []).filter((item) => isVisible(item)).map((item) => {
    const itemSlug = slugify(item.url_name || item.label);
    return {
      id: item._uid,
      label: item.label,
      href: linkHref(item.link),
      editable: storyblokEditable(item),
      columns: (item.columns ?? []).filter((column) => isVisible(column)).map((column) => ({
        id: column._uid,
        heading: column.heading,
        editable: storyblokEditable(column),
        links: (column.links ?? []).filter((link) => isVisible(link)).map((link) => ({
          id: link._uid,
          label: link.label,
          href: linkHref(link.link) || `/${itemSlug}/${slugify(link.url_name || link.label)}`,
          editable: storyblokEditable(link),
        })),
      })),
    };
  });
}

function fromPim(categories) {
  return categories.map((category) => {
    const label = categoryName(category);
    const children = category.children ?? [];
    return {
      id: category.category_id,
      label,
      href: "",
      editable: {},
      columns: children.length
        ? [
            {
              id: `${category.category_id}-style`,
              heading: "STYLE",
              editable: {},
              links: children.map((child) => {
                const childLabel = categoryName(child, "Sub Category");
                return {
                  id: child.category_id,
                  label: childLabel,
                  href: `/${slugify(label)}/${slugify(childLabel)}`,
                  editable: {},
                };
              }),
            },
          ]
        : [],
    };
  });
}

export async function getMenu(locale) {
  try {
    const story = await fetchStory(MENU_SLUG);
    if (story?.content?.component === "navigation") return fromStoryblok(story);
  } catch (error) {
    console.error("Header navigation (Storyblok):", error.message);
  }
  return fromPim(await getNavigation(locale));
}
