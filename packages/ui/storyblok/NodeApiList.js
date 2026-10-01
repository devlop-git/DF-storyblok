import { storyblokEditable } from "@storyblok/react/rsc";

import { fetchNodeApi } from "@df/core/lib/nodeApi";

/**
 * A block that mixes CMS content with live data from our Node API.
 *
 * Storyblok fields (create a "node_api_list" nestable block with these):
 *   - title    (Text)     heading shown above the list
 *   - endpoint (Text)     Node API path, e.g. "/products?category=rings"
 *   - limit    (Number)   max items to show
 *
 * Editors choose where the block goes and what it fetches; the data comes from Node.
 * Adjust the item rendering below to match your API's response shape.
 */
export default async function NodeApiList({ blok }) {
  let items = [];
  let error = null;

  try {
    const data = await fetchNodeApi(blok.endpoint || "/");
    items = Array.isArray(data) ? data : (data.data ?? data.items ?? []);
  } catch (e) {
    error = e.message;
  }

  const limit = Number(blok.limit) || items.length;

  return (
    <section {...storyblokEditable(blok)} className="mb-8">
      {blok.title && <h2 className="mb-4 text-2xl font-semibold">{blok.title}</h2>}

      {error ? (
        <p className="text-red-600">Could not load data: {error}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {items.slice(0, limit).map((item, i) => (
            <li key={item.id ?? i} className="rounded-lg border p-4">
              {item.name ?? item.title ?? JSON.stringify(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
