// Exports the Storyblok space into the repo, for disaster recovery or moving
// to another space:
//
//   npm run backup:df                    -> tools/storyblok/backup/diamondsfactory/<YYYY-MM-DD>/
//   npm run backup:ab                    -> tools/storyblok/backup/austenblake/<YYYY-MM-DD>/
//   npm run backup:df -- --with-assets   -> also downloads the image/files into assets/
//
// Contents: components.json, component_groups.json, stories/<full_slug>.json
// (every story incl. drafts; folders as <slug>/_folder.json), assets.json,
// datasources.json.
//
// Env (apps/<brand>/.env.local): STORYBLOK_SPACE_ID, STORYBLOK_MANAGEMENT_TOKEN, STORYBLOK_REGION

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WITH_ASSETS = process.argv.includes("--with-assets");
const today = new Date().toISOString().slice(0, 10);
// Brand folder from the first argument (set by the npm scripts).
const brandId = process.argv.slice(2).find((arg) => !arg.startsWith("--")) || "diamondsfactory";
const OUT_DIR = path.join(fileURLToPath(new URL("./backup", import.meta.url)), brandId, today);

// Management API hosts per region (same as migrate-strapi-schema.mjs).
const MAPI_HOSTS = {
  eu: "https://mapi.storyblok.com",
  us: "https://api-us.storyblok.com",
  ap: "https://api-ap.storyblok.com",
  ca: "https://api-ca.storyblok.com",
  cn: "https://app.storyblokchina.cn",
};

function mapiClient() {
  const spaceId = process.env.STORYBLOK_SPACE_ID;
  const token = process.env.STORYBLOK_MANAGEMENT_TOKEN;
  const region = (process.env.STORYBLOK_REGION || "eu").toLowerCase();
  if (!spaceId || !token) {
    throw new Error("Set STORYBLOK_SPACE_ID and STORYBLOK_MANAGEMENT_TOKEN in .env.local");
  }
  if (!MAPI_HOSTS[region]) {
    throw new Error(`Unknown STORYBLOK_REGION "${region}" (use ${Object.keys(MAPI_HOSTS).join(", ")})`);
  }
  const base = `${MAPI_HOSTS[region]}/v1/spaces/${spaceId}`;

  return async function mapi(route) {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`${base}${route}`, { headers: { Authorization: token } });
      if (res.status === 429 && attempt < 5) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      const text = await res.text();
      if (!res.ok) throw new Error(`GET ${route} -> ${res.status}: ${text}`);
      return { body: text ? JSON.parse(text) : {}, total: Number(res.headers.get("total") || 0) };
    }
  };
}

// Fetches every page of a paginated list endpoint.
async function getAll(mapi, route, key) {
  const items = [];
  for (let page = 1; ; page++) {
    const sep = route.includes("?") ? "&" : "?";
    const { body, total } = await mapi(`${route}${sep}per_page=100&page=${page}`);
    const batch = body[key] ?? [];
    items.push(...batch);
    if (batch.length < 100 || (total && items.length >= total)) return items;
  }
}

async function writeJson(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

// "customer-care/valuations" -> stories/customer-care/valuations.json;
// folders -> stories/<slug>/_folder.json; a folder's start page ("plp/") -> plp/index.json.
function storyFile(story) {
  const slug = (story.full_slug || story.uuid).replace(/[<>:"\\|?*]/g, "_");
  if (story.is_folder) return path.join(OUT_DIR, "stories", slug.replace(/\/$/, ""), "_folder.json");
  const clean = slug.endsWith("/") ? `${slug}index` : slug;
  return path.join(OUT_DIR, "stories", `${clean}.json`);
}

const mapi = mapiClient();

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

// Blocks
const { body: { components } } = await mapi("/components");
const { body: { component_groups } } = await mapi("/component_groups");
await writeJson(path.join(OUT_DIR, "components.json"), components);
await writeJson(path.join(OUT_DIR, "component_groups.json"), component_groups);
console.log(`blocks:      ${components.length} (${component_groups.length} folders)`);

// Stories: the list has no content, so fetch each one (draft content included).
const storyList = await getAll(mapi, "/stories", "stories");
for (const item of storyList) {
  const { body } = await mapi(`/stories/${item.id}`);
  await writeJson(storyFile(body.story), body.story);
}
console.log(`stories:     ${storyList.filter((s) => !s.is_folder).length} (+${storyList.filter((s) => s.is_folder).length} folders)`);

// Assets (metadata; files optional)
const assets = await getAll(mapi, "/assets", "assets");
await writeJson(path.join(OUT_DIR, "assets.json"), assets);
console.log(`assets:      ${assets.length}`);

if (WITH_ASSETS) {
  const assetDir = path.join(OUT_DIR, "assets");
  await mkdir(assetDir, { recursive: true });
  for (const asset of assets) {
    const url = asset.filename;
    if (!url) continue;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  skipped ${url} (${res.status})`);
      continue;
    }
    const name = `${asset.id}-${path.basename(new URL(url).pathname)}`;
    await writeFile(path.join(assetDir, name), Buffer.from(await res.arrayBuffer()));
  }
  console.log(`             downloaded to ${assetDir}`);
}

// Datasources (+ their entries)
const { body: { datasources = [] } } = await mapi("/datasources");
for (const ds of datasources) {
  ds.entries = await getAll(mapi, `/datasource_entries?datasource_id=${ds.id}`, "datasource_entries");
}
await writeJson(path.join(OUT_DIR, "datasources.json"), datasources);
console.log(`datasources: ${datasources.length}`);

console.log(`\nBackup written to ${OUT_DIR}`);
