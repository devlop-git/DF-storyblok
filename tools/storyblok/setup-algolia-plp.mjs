// Sets up the Algolia PLP in the Storyblok "Technical POC" space:
//   - the blocks a listing page needs (plp_page with an algoliaCategory field,
//     algolia_product_listing, plp_promo_tile + the shared config/content
//     blocks from ./components)
//   - "plp-layout": the ONE layout story for every menu URL
//     (/engagement-rings/solitaire); the category comes from the URL
//
//   npm run setup:algolia-plp -- --dry-run   -> only prints what it would create / change
//   npm run setup:algolia-plp                -> writes to the space
//
// Env (apps/technicalpoc/.env.local): STORYBLOK_SPACE_ID,
// STORYBLOK_MANAGEMENT_TOKEN (My Account > Personal access tokens), STORYBLOK_REGION.
// Safe to re-run: existing blocks only get missing fields, existing stories
// (same slug) are left alone.

import { readFile } from "node:fs/promises";

const MAPI_HOSTS = {
  eu: "https://mapi.storyblok.com",
  us: "https://api-us.storyblok.com",
  ap: "https://api-ap.storyblok.com",
  ca: "https://api-ca.storyblok.com",
  cn: "https://app.storyblokchina.cn",
};

const GROUP = "Algolia PLP";

// Reused as-is from the schema export of the brand spaces.
const SHARED_BLOCKS = [
  "toolbar_configuration",
  "filter_configuration",
  "product_grid_cofiguration",
  "banner_info",
  "read_more_content",
  "rich_text",
];

const PLP_SECTIONS = ["banner_info", "algolia_product_listing", "read_more_content", "rich_text"];

// Must match categories_hierarchical.lvl0 in the Algolia index (see
// packages/ui/plp/algolia/config.js -> ALGOLIA_CATEGORIES).
const ALGOLIA_CATEGORIES = [
  "Engagement Ring",
  "Diamond Ring",
  "Gemstone",
  "Wedding Ring",
  "Earrings",
  "Pendant",
  "Bracelet",
  "Diamond Jewellery Gifts Sets",
  "Leaf & Clover Collection",
  "Gift Sets",
];

const NEW_BLOCKS = [
  {
    name: "plp_promo_tile",
    display_name: "PLP Promo Tile",
    is_root: false,
    is_nestable: true,
    schema: {
      title: { pos: 0, type: "text" },
      text: { pos: 1, type: "textarea" },
      button_label: { pos: 2, type: "text" },
      link: { pos: 3, type: "multilink" },
      image: { pos: 4, type: "asset", filetypes: ["images"] },
      position: {
        pos: 5,
        type: "number",
        default_value: "4",
        description: "Grid cell the tile takes (1 = first)",
      },
    },
  },
  {
    name: "algolia_product_listing",
    display_name: "Algolia Product Listing",
    is_root: false,
    is_nestable: true,
    schema: {
      hits_per_page: {
        pos: 0,
        type: "number",
        default_value: "24",
        description: "Designs per page",
      },
      show_search: { pos: 5, type: "boolean", default_value: true, description: "Smart search box above the products" },
      search_placeholder: { pos: 6, type: "text" },
      toolbarConfig: { pos: 1, type: "bloks", restrict_components: true, component_whitelist: ["toolbar_configuration"], maximum: 1 },
      filterConfig: { pos: 2, type: "bloks", restrict_components: true, component_whitelist: ["filter_configuration"], maximum: 1 },
      gridConfig: { pos: 3, type: "bloks", restrict_components: true, component_whitelist: ["product_grid_cofiguration"], maximum: 1 },
      promo_tiles: { pos: 4, type: "bloks", restrict_components: true, component_whitelist: ["plp_promo_tile"] },
    },
  },
  {
    name: "plp_page",
    display_name: "PLP Page",
    is_root: true,
    is_nestable: false,
    schema: {
      title: { pos: 0, type: "text" },
      algoliaCategory: {
        pos: 1,
        type: "option",
        options: ALGOLIA_CATEGORIES.map((name) => ({ name, value: name })),
        description: "Algolia category (categories_hierarchical.lvl0) this page lists; empty = all products",
      },
      plp_section: {
        pos: 2,
        type: "bloks",
        restrict_components: true,
        component_whitelist: PLP_SECTIONS,
        description: "Sections around the products; the Algolia Product Listing block shows them",
      },
    },
  },
];

const richText = (text) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

// A listing page: intro banner, products (promo tile in cell 4), SEO text.
function plpStory({ name, slug, category, intro }) {
  return {
    name,
    slug,
    content: {
      component: "plp_page",
      title: name,
      algoliaCategory: category,
      plp_section: [
        { component: "banner_info", title: name, description: richText(intro) },
        {
          component: "algolia_product_listing",
          hits_per_page: "24",
          show_search: true,
          toolbarConfig: [
            { component: "toolbar_configuration", showSort: true, showProductCount: true, showFilterButton: true },
          ],
          filterConfig: [{ component: "filter_configuration", position: "left", sticky: true, width: "280" }],
          gridConfig: [
            { component: "product_grid_cofiguration", desktopColumns: "3", tabColumns: "2", mobileColumns: "2" },
          ],
          promo_tiles: [
            {
              component: "plp_promo_tile",
              title: "Book an appointment",
              text: "Receive €100 off when you spend €1,800 in-store.",
              button_label: "Book now",
              position: "4",
            },
          ],
        },
        {
          component: "read_more_content",
          title: name,
          previewContent: intro,
          expandedContent: richText("Every piece is made to order in your choice of metal and stone."),
          readMoreLabel: "Read more",
          readLessLabel: "Read less",
        },
      ],
    },
  };
}

const PLP_STORIES = [
  // Layout of every menu URL (/engagement-rings/solitaire): the category comes
  // from the URL, so no algoliaCategory and no fixed banner title here.
  (() => {
    const story = plpStory({ name: "PLP Layout", slug: "plp-layout", category: "", intro: "" });
    story.content.plp_section = story.content.plp_section.filter((s) => s.component !== "banner_info");
    return story;
  })(),
];

function mapiClient() {
  const spaceId = process.env.STORYBLOK_SPACE_ID?.replace(/^#/, "");
  const token = process.env.STORYBLOK_MANAGEMENT_TOKEN;
  const region = (process.env.STORYBLOK_REGION || "eu").toLowerCase();
  if (!spaceId || !token) {
    throw new Error("Set STORYBLOK_SPACE_ID and STORYBLOK_MANAGEMENT_TOKEN in apps/technicalpoc/.env.local");
  }
  const base = `${MAPI_HOSTS[region]}/v1/spaces/${spaceId}`;

  return async function mapi(method, route, body) {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`${base}${route}`, {
        method,
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: body && JSON.stringify(body),
      });
      if (res.status === 429 && attempt < 5) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      const text = await res.text();
      if (!res.ok) throw new Error(`${method} ${route} -> ${res.status}: ${text}`);
      return text ? JSON.parse(text) : {};
    }
  };
}

const DRY_RUN = process.argv.includes("--dry-run");
const client = mapiClient();
// Reads always run; writes are only printed in a dry run.
async function mapi(method, route, body) {
  if (!DRY_RUN || method === "GET") return client(method, route, body);
  console.log(`  (dry run) ${method} ${route}`);
  return { component_group: { uuid: "dry-run" } };
}
if (DRY_RUN) console.log("DRY RUN: nothing is written to Storyblok.\n");

const shared = await Promise.all(
  SHARED_BLOCKS.map(async (name) => {
    const { group, ...block } = JSON.parse(
      await readFile(new URL(`./components/${name}.json`, import.meta.url), "utf8"),
    );
    // rich_text etc. may allow blocks this space doesn't have; keep the field, drop the list.
    for (const field of Object.values(block.schema)) {
      if (field.component_whitelist) {
        field.component_whitelist = field.component_whitelist.filter((n) =>
          [...SHARED_BLOCKS, ...NEW_BLOCKS.map((b) => b.name)].includes(n),
        );
      }
    }
    return block;
  }),
);

// ---------- blocks ----------

const { component_groups: groups } = await mapi("GET", "/component_groups");
let groupUuid = groups.find((g) => g.name === GROUP)?.uuid;
if (!groupUuid) {
  ({ component_group: { uuid: groupUuid } } = await mapi("POST", "/component_groups", {
    component_group: { name: GROUP },
  }));
  console.log(`+ folder  ${GROUP}`);
}

const { components: existing } = await mapi("GET", "/components");
const existingByName = new Map(existing.map((c) => [c.name, c]));

for (const block of [...shared, ...NEW_BLOCKS]) {
  const current = existingByName.get(block.name);
  if (!current) {
    await mapi("POST", "/components", { component: { ...block, component_group_uuid: groupUuid } });
    console.log(`+ created ${block.name}`);
    continue;
  }
  // Changes made in the Storyblok UI win; only missing fields are added.
  const added = Object.keys(block.schema).filter((key) => !current.schema[key]);
  if (!added.length) {
    console.log(`= exists  ${block.name}`);
    continue;
  }
  const maxPos = Math.max(-1, ...Object.values(current.schema).map((f) => f.pos ?? 0));
  const schema = { ...current.schema };
  added.forEach((key, i) => (schema[key] = { ...block.schema[key], pos: maxPos + 1 + i }));
  await mapi("PUT", `/components/${current.id}`, { component: { ...current, schema } });
  console.log(`~ updated ${block.name} (+${added.join(", ")})`);
}

// ---------- listing stories ----------

for (const story of PLP_STORIES) {
  const { stories } = await mapi("GET", `/stories?with_slug=${story.slug}`);
  if (stories?.length) {
    console.log(`= story   /${story.slug} already exists`);
    continue;
  }
  await mapi("POST", "/stories", { story, publish: 1 });
  console.log(`+ story   /${story.slug} (${story.content.algoliaCategory || "all products"}), published`);
}
console.log("\nDone. Run npm run dev:tp and open a menu URL, e.g. /engagement-rings/solitaire.");
