// Copies the Diamonds Factory content (home page, header, footer, markets,
// static pages) from the DF Storyblok space into the "Technical POC" space, so
// one space holds home + Algolia PLP + navigation + PDP.
//
//   npm run migrate:df-to-tp -- --dry-run   -> only prints what it would do
//   npm run migrate:df-to-tp                -> writes to Technical POC
//
// What it does:
//   1. Blocks: every DF block except plp_page (Technical POC has the Algolia
//      version) is created in "DF …" folders; blocks that already exist only
//      get missing fields.
//   2. Images used by the copied stories are downloaded from the DF space and
//      uploaded to Technical POC's asset library; the stories point to the copies.
//   3. Stories: settings + home pages go into a "site" folder (they're looked up
//      by content type, and Technical POC already has other stories called
//      home / about); static pages go to the root. Default language only.
//      References between stories (market, footer columns) are re-pointed to
//      the new copies. Published state is kept.
// Safe to re-run: existing blocks, assets (same file name) and stories (same
// slug) are reused, never overwritten.
//
// Env (apps/technicalpoc/.env.local): STORYBLOK_SPACE_ID (target),
// STORYBLOK_MANAGEMENT_TOKEN (a personal token with access to both spaces).

const SOURCE_SPACE = process.env.SOURCE_SPACE_ID || "295526440790014"; // DF "POC"
const TARGET_SPACE = process.env.STORYBLOK_SPACE_ID?.replace(/^#/, "");
const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;
const DRY_RUN = process.argv.includes("--dry-run");

const SKIP_BLOCKS = new Set(["plp_page"]); // Technical POC's plp_page is the Algolia layout
const SKIP_STORY_TYPES = new Set(["plp_page"]); // old Commerce PLP layout, replaced by "PLP Layout"
const SITE_FOLDER = "site";
const ROOT_TYPES = new Set(["static_page"]); // pages served at their slug

if (!TARGET_SPACE || !TOKEN) throw new Error("Set STORYBLOK_SPACE_ID and STORYBLOK_MANAGEMENT_TOKEN");

async function mapi(space, method, route, body) {
  if (DRY_RUN && method !== "GET" && space === TARGET_SPACE) {
    console.log(`  (dry run) ${method} ${route}`);
    return null;
  }
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://mapi.storyblok.com/v1/spaces/${space}${route}`, {
      method,
      headers: { Authorization: TOKEN, "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    });
    if (res.status === 429 && attempt < 6) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${route} -> ${res.status}: ${text}`);
    return text ? JSON.parse(text) : {};
  }
}
const src = (method, route, body) => mapi(SOURCE_SPACE, method, route, body);
const dst = (method, route, body) => mapi(TARGET_SPACE, method, route, body);

async function allStories(get) {
  const out = [];
  for (let page = 1; ; page++) {
    const { stories } = await get("GET", `/stories?per_page=100&page=${page}`);
    out.push(...stories);
    if (stories.length < 100) return out;
  }
}

// Recursively visits every object in a story's content.
function walk(value, visit) {
  if (Array.isArray(value)) value.forEach((v) => walk(v, visit));
  else if (value && typeof value === "object") {
    visit(value);
    Object.values(value).forEach((v) => walk(v, visit));
  }
}

if (DRY_RUN) console.log("DRY RUN: nothing is written to Technical POC.\n");

// ---------- 1. blocks ----------

console.log("== Blocks");
const [{ components: srcComponents }, { component_groups: srcGroups }] = await Promise.all([
  src("GET", "/components"),
  src("GET", "/component_groups"),
]);
const [{ components: dstComponents }, { component_groups: dstGroups }] = await Promise.all([
  dst("GET", "/components"),
  dst("GET", "/component_groups"),
]);
const srcGroupName = new Map(srcGroups.map((g) => [g.uuid, g.name]));
const dstGroupUuid = new Map(dstGroups.map((g) => [g.name, g.uuid]));
const dstByName = new Map(dstComponents.map((c) => [c.name, c]));

async function groupFor(component) {
  const name = `DF ${srcGroupName.get(component.component_group_uuid) ?? "Blocks"}`;
  if (!dstGroupUuid.has(name)) {
    const created = await dst("POST", "/component_groups", { component_group: { name } });
    dstGroupUuid.set(name, created?.component_group?.uuid ?? `dry-run-${name}`);
    console.log(`+ folder  ${name}`);
  }
  return dstGroupUuid.get(name);
}

for (const component of srcComponents) {
  if (SKIP_BLOCKS.has(component.name)) continue;
  const current = dstByName.get(component.name);
  if (!current) {
    const { name, display_name, schema, is_root, is_nestable, preview_field, image, color, icon } = component;
    await dst("POST", "/components", {
      component: {
        name, display_name, schema, is_root, is_nestable, preview_field, image, color, icon,
        component_group_uuid: await groupFor(component),
      },
    });
    console.log(`+ block   ${component.name}`);
    continue;
  }
  const added = Object.keys(component.schema).filter((key) => !current.schema[key]);
  if (!added.length) continue;
  const maxPos = Math.max(-1, ...Object.values(current.schema).map((f) => f.pos ?? 0));
  const schema = { ...current.schema };
  added.forEach((key, i) => (schema[key] = { ...component.schema[key], pos: maxPos + 1 + i }));
  await dst("PUT", `/components/${current.id}`, { component: { ...current, schema } });
  console.log(`~ block   ${component.name} (+${added.join(", ")})`);
}

// ---------- 2. stories to copy ----------

const srcStories = (await allStories(src)).filter((s) => !s.is_folder);
const toCopy = [];
for (const summary of srcStories) {
  const { story } = await src("GET", `/stories/${summary.id}`);
  if (SKIP_STORY_TYPES.has(story.content.component)) continue;
  // Default language only: drop field-level translations ("title__i18n__de").
  walk(story.content, (obj) => {
    for (const key of Object.keys(obj)) if (key.includes("__i18n__")) delete obj[key];
  });
  toCopy.push(story);
}

// ---------- 3. images ----------

console.log("\n== Images");
const urls = new Set();
for (const story of toCopy) {
  walk(story.content, (obj) => {
    if (typeof obj.filename === "string" && obj.filename.includes(`/f/${SOURCE_SPACE}/`)) urls.add(obj.filename);
  });
}

// Already uploaded (re-run): match by file name.
const existingAssets = new Map();
for (let page = 1; ; page++) {
  const { assets } = await dst("GET", `/assets?per_page=100&page=${page}`);
  assets.forEach((a) => existingAssets.set(a.filename.split("/").pop(), a));
  if (assets.length < 100) break;
}

const assetMap = new Map(); // old url -> { filename, id }
for (const url of urls) {
  const name = url.split("/").pop();
  const existing = existingAssets.get(name);
  if (existing) {
    assetMap.set(url, { filename: existing.filename, id: existing.id });
    console.log(`= image   ${name}`);
    continue;
  }
  if (DRY_RUN) {
    console.log(`  (dry run) upload ${name}`);
    continue;
  }
  const file = await fetch(url);
  if (!file.ok) {
    console.log(`! image   ${name}: download failed (${file.status}), keeping the DF URL`);
    continue;
  }
  const blob = await file.blob();
  const size = url.match(/\/(\d+x\d+)\//)?.[1];
  const signed = await dst("POST", "/assets", { filename: name, ...(size && { size }), validate_upload: 1 });
  const form = new FormData();
  Object.entries(signed.fields).forEach(([k, v]) => form.append(k, v));
  form.append("file", blob, name);
  const upload = await fetch(signed.post_url, { method: "POST", body: form });
  if (!upload.ok && upload.status !== 204) throw new Error(`upload ${name} -> ${upload.status}`);
  await dst("GET", `/assets/${signed.id}/finish_upload`);
  assetMap.set(url, { filename: signed.pretty_url.replace(/^\/\//, "https://"), id: signed.id });
  console.log(`+ image   ${name}`);
}

// ---------- 4. stories ----------

console.log("\n== Stories");
const dstStories = await allStories(dst);
const dstBySlug = new Map(dstStories.map((s) => [s.full_slug, s]));

let siteFolder = dstBySlug.get(SITE_FOLDER);
if (!siteFolder) {
  const created = await dst("POST", "/stories", {
    story: { name: "Site (DF content)", slug: SITE_FOLDER, is_folder: true },
  });
  siteFolder = created?.story ?? { id: 0 };
  console.log(`+ folder  /${SITE_FOLDER}`);
}

// Pass 1: create every story (unpublished) to get its new uuid.
const uuidMap = new Map(); // DF uuid -> Technical POC uuid
const created = []; // [{ source, target }]
for (const story of toCopy) {
  const inRoot = ROOT_TYPES.has(story.content.component);
  const fullSlug = inRoot ? story.slug : `${SITE_FOLDER}/${story.slug}`;
  const existing = dstBySlug.get(fullSlug);
  if (existing) {
    uuidMap.set(story.uuid, existing.uuid);
    console.log(`= story   /${fullSlug} already exists`);
    continue;
  }
  const result = await dst("POST", "/stories", {
    story: {
      name: story.name,
      slug: story.slug,
      parent_id: inRoot ? 0 : siteFolder.id,
      path: story.path || undefined,
      content: story.content,
    },
  });
  if (result) uuidMap.set(story.uuid, result.story.uuid);
  created.push({ source: story, target: result?.story, fullSlug });
  console.log(`+ story   /${fullSlug} [${story.content.component}]${story.published ? "" : " (draft in DF)"}`);
}

// Pass 2: point references and images at the copies, then publish like in DF.
for (const { source, target, fullSlug } of created) {
  if (!target) continue;
  let json = JSON.stringify(source.content);
  for (const [oldUuid, newUuid] of uuidMap) json = json.split(oldUuid).join(newUuid);
  const content = JSON.parse(json);
  walk(content, (obj) => {
    const copy = typeof obj.filename === "string" && assetMap.get(obj.filename);
    if (copy) {
      obj.filename = copy.filename;
      obj.id = copy.id;
    }
  });
  await dst("PUT", `/stories/${target.id}`, {
    story: { ...target, content },
    ...(source.published && { publish: 1 }),
  });
  console.log(`~ story   /${fullSlug}: references + images updated${source.published ? ", published" : ""}`);
}

console.log("\nDone.");
