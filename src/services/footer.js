import { getCurrentMarketStory } from "@/lib/market";
import { fetchStories } from "@/lib/storyblok";

// Footer data from Storyblok, same model as the Strapi frontend:
//
// - "footer" story (content type footer): logo, social links, copyright, and
//   `columns` -- references to "footer_column" stories. Only active columns
//   are shown, sorted by their `order` field. With several footer stories,
//   the one whose `market` is the current market wins.
// - "static_page" stories push themselves into a column: `show_in_footer` +
//   `footer_column`, filtered to the current market, sorted by
//   `footer_order` then title. No separate link list to maintain.
//
// Returns { footer, columns, pagesByColumn, market } or null without a footer story.
export async function getFooter() {
  const marketStory = await getCurrentMarketStory();

  const footers = await fetchStories({
    content_type: "footer",
    resolve_relations: "footer.columns",
  });
  const footer =
    footers.find((f) => marketStory && f.content?.market === marketStory.uuid) ??
    footers[0];
  if (!footer) return null;

  // Resolved relations become story objects; unresolvable ones stay uuid strings.
  const columns = (footer.content.columns ?? [])
    .filter((column) => typeof column === "object" && column.content?.active)
    .sort((a, b) => Number(a.content.order || 0) - Number(b.content.order || 0));

  const pages = await fetchStories({
    content_type: "static_page",
    filter_query: {
      show_in_footer: { is: "true" },
      ...(marketStory && { market: { in: marketStory.uuid } }),
    },
  });

  const pagesByColumn = {};
  for (const page of pages) {
    const columnId = page.content?.footer_column;
    if (!columnId) continue;
    (pagesByColumn[columnId] ??= []).push({
      title: page.content.title || page.name,
      path: storyPath(page),
      order: Number(page.content.footer_order || 0),
    });
  }
  for (const list of Object.values(pagesByColumn)) {
    list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }

  return {
    footer: footer.content,
    columns,
    pagesByColumn,
    market: marketStory?.content,
  };
}

// A story's URL on the site: its "Real path" if set in Storyblok, else its
// folder path (full_slug), e.g. "customer-care/valuations".
function storyPath(story) {
  const path = story.path || story.full_slug;
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}
