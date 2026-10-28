// Sets up the Storyblok-managed header menu in a brand's space:
//   - blocks navigation (content type) -> nav_item -> nav_column -> nav_link
//   - a published "Main Navigation" story (slug main-navigation), pre-filled
//     with today's menu from the PIM category API, so the business team starts
//     from the current menu
//
//   npm run setup:navigation:tp -- --dry-run   -> only prints what it would do
//   npm run setup:navigation:tp                -> writes to the space
//
// Env (apps/<app>/.env.local): STORYBLOK_SPACE_ID, STORYBLOK_MANAGEMENT_TOKEN,
// STORYBLOK_REGION, CATEGORY_API_URL. Safe to re-run: existing blocks only get
// missing fields, an existing Main Navigation story is left alone.

const MAPI_HOSTS = {
  eu: "https://mapi.storyblok.com",
  us: "https://api-us.storyblok.com",
  ap: "https://api-ap.storyblok.com",
  ca: "https://api-ca.storyblok.com",
  cn: "https://app.storyblokchina.cn",
};
const CATEGORY_API = process.env.CATEGORY_API_URL || "http://localhost:8010/api/category/v1";
const GROUP = "Navigation";
const MENU_SLUG = "main-navigation";
const DRY_RUN = process.argv.includes("--dry-run");

const urlNameHelp =
  "Optional. Name used in the URL instead of the label (keeps the URL when the label is renamed or translated)";
const linkHelp = "Optional. Overrides the automatic URL, e.g. a Sale or campaign page";

// "Hide for a while" fields on every menu level (see isVisible in services/navigation.js).
const visibilityFields = (pos) => ({
  hide: { pos, type: "boolean", description: "Hide from the menu (nothing is deleted)" },
  show_from: { pos: pos + 1, type: "datetime", description: "Optional. Hidden until this date/time (UTC)" },
  show_until: { pos: pos + 2, type: "datetime", description: "Optional. Hidden from this date/time (UTC)" },
});

const BLOCKS = [
  {
    name: "nav_link",
    display_name: "Menu Link",
    is_root: false,
    is_nestable: true,
    schema: {
      label: { pos: 0, type: "text", translatable: true, required: true },
      url_name: { pos: 1, type: "text", description: urlNameHelp },
      link: { pos: 2, type: "multilink", description: linkHelp },
      ...visibilityFields(3),
    },
  },
  {
    name: "nav_column",
    display_name: "Menu Column",
    is_root: false,
    is_nestable: true,
    schema: {
      heading: { pos: 0, type: "text", translatable: true, description: "e.g. STYLE, SHAPE" },
      links: { pos: 1, type: "bloks", restrict_components: true, component_whitelist: ["nav_link"] },
      ...visibilityFields(2),
    },
  },
  {
    name: "nav_item",
    display_name: "Menu Item",
    is_root: false,
    is_nestable: true,
    schema: {
      label: { pos: 0, type: "text", translatable: true, required: true },
      url_name: { pos: 1, type: "text", description: urlNameHelp },
      link: { pos: 2, type: "multilink", description: linkHelp },
      columns: { pos: 3, type: "bloks", restrict_components: true, component_whitelist: ["nav_column"] },
      ...visibilityFields(4),
    },
  },
  {
    name: "navigation",
    display_name: "Navigation",
    is_root: true,
    is_nestable: false,
    schema: {
      items: {
        pos: 0,
        type: "bloks",
        restrict_components: true,
        component_whitelist: ["nav_item"],
        description: "Header menu: add, remove or drag to reorder",
      },
    },
  },
];

// ---------- today's menu from the PIM category API ----------

const nameOf = (c) => c.category_details?.displayCategoryName?.en ?? c.category_details?.categoryName;

async function categoryApi(query) {
  const res = await fetch(`${CATEGORY_API}?${query}&batchSize=100`);
  if (!res.ok) throw new Error(`Category API ${res.status}: ${await res.text()}`);
  return (await res.json()).data ?? [];
}

async function pimMenu() {
  const all = await categoryApi("language=en");
  const tops = all.filter((c) => !c.category_details?.parentCategoryId);
  return Promise.all(
    tops.map(async (top) => {
      const filterQuery = encodeURIComponent(JSON.stringify({ category_details: { isLastLevel: true } }));
      const search = encodeURIComponent(JSON.stringify({ pathToParent: top.category_id }));
      const subs = await categoryApi(`filterQuery=${filterQuery}&search=${search}&language=en`);
      return { label: nameOf(top), children: subs.map(nameOf) };
    }),
  );
}

function menuStory(menu) {
  return {
    name: "Main Navigation",
    slug: MENU_SLUG,
    path: "/", // Visual Editor preview: the header is on every page
    content: {
      component: "navigation",
      items: menu.map(({ label, children }) => ({
        component: "nav_item",
        label,
        columns: children.length
          ? [
              {
                component: "nav_column",
                heading: "STYLE",
                links: children.map((child) => ({ component: "nav_link", label: child })),
              },
            ]
          : [],
      })),
    },
  };
}

// ---------- Management API ----------

const spaceId = process.env.STORYBLOK_SPACE_ID?.replace(/^#/, "");
const token = process.env.STORYBLOK_MANAGEMENT_TOKEN;
const region = (process.env.STORYBLOK_REGION || "eu").toLowerCase();
if (!spaceId || !token) throw new Error("Set STORYBLOK_SPACE_ID and STORYBLOK_MANAGEMENT_TOKEN in the app's .env.local");
const base = `${MAPI_HOSTS[region]}/v1/spaces/${spaceId}`;

async function mapi(method, route, body) {
  if (DRY_RUN && method !== "GET") {
    console.log(`  (dry run) ${method} ${route}`);
    return { component_group: { uuid: "dry-run" } };
  }
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
}

if (DRY_RUN) console.log("DRY RUN: nothing is written to Storyblok.\n");

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
const byName = new Map(existing.map((c) => [c.name, c]));
for (const block of BLOCKS) {
  const current = byName.get(block.name);
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

// ---------- Main Navigation story ----------

const { stories } = await mapi("GET", `/stories?with_slug=${MENU_SLUG}`);
if (stories?.length) {
  console.log(`= story   /${MENU_SLUG} already exists`);
} else {
  const menu = await pimMenu();
  for (const { label, children } of menu) console.log(`    ${label}: ${children.join(", ") || "-"}`);
  await mapi("POST", "/stories", { story: menuStory(menu), publish: 1 });
  console.log(`+ story   /${MENU_SLUG} (Main Navigation, ${menu.length} menus from PIM), published`);
}

console.log("\nDone. Edit the menu in Storyblok: Content -> Main Navigation.");
