// Converts Strapi v5 schema files (content types + components) into Storyblok blocks.
//
//   npm run migrate:schema              -> dry run: writes storyblok/components/*.json for review
//   npm run migrate:schema -- --push    -> creates / updates the blocks in your Storyblok space
//
// Env (.env.local): STRAPI_CMS_PATH, STORYBLOK_SPACE_ID, STORYBLOK_MANAGEMENT_TOKEN, STORYBLOK_REGION

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const STRAPI_SRC = process.env.STRAPI_CMS_PATH || "D:/diamondfactory-poc/cms/src";
const OUT_DIR = path.resolve("storyblok/components");
const PUSH = process.argv.includes("--push");

// Management API hosts per region (the space's region is shown in Settings > Space).
const MAPI_HOSTS = {
  eu: "https://mapi.storyblok.com",
  us: "https://api-us.storyblok.com",
  ap: "https://api-ap.storyblok.com",
  ca: "https://api-ca.storyblok.com",
  cn: "https://app.storyblokchina.cn",
};

// Strapi's display groups become Storyblok block folders.
const GROUP_COLLECTION = "Collection Types";
const GROUP_SINGLE = "Single Types";

// Inverse relations editors pick on the page itself (the "market" dropdown
// Strapi showed on HomePage / PLP Page), so they're kept on this side too.
const KEEP_INVERSE_RELATIONS = new Set(["home_page.market", "plp_page.markets"]);

const warnings = [];
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// "hero-banner" / "api::home-page.home-page" / "grids.feature-item" -> "hero_banner" / "home_page" / "feature_item"
function technicalName(strapiRef) {
  const last = strapiRef.split(/[.:]/).pop();
  return last.replace(/-/g, "_").toLowerCase();
}

function titleCase(kebab) {
  return kebab.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------- reading Strapi ----------

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function loadStrapiSchemas() {
  const schemas = [];

  const apiDir = path.join(STRAPI_SRC, "api");
  for (const api of await readdir(apiDir)) {
    const ctDir = path.join(apiDir, api, "content-types");
    let types = [];
    try {
      types = await readdir(ctDir);
    } catch {
      continue; // api folder without content types (custom routes only)
    }
    for (const ct of types) {
      const schema = await readJson(path.join(ctDir, ct, "schema.json"));
      schemas.push({ kind: schema.kind, name: technicalName(ct), schema });
    }
  }

  const compDir = path.join(STRAPI_SRC, "components");
  for (const category of await readdir(compDir)) {
    const catDir = path.join(compDir, category);
    for (const file of await readdir(catDir)) {
      if (!file.endsWith(".json")) continue;
      const schema = await readJson(path.join(catDir, file));
      schemas.push({
        kind: "component",
        name: technicalName(file.replace(/\.json$/, "")),
        category,
        schema,
      });
    }
  }

  return schemas;
}

// ---------- converting fields ----------

function assetFiletypes(allowedTypes) {
  if (!allowedTypes || allowedTypes.length >= 4) return undefined; // all types allowed
  const map = { images: "images", videos: "videos", audios: "audios", files: "texts" };
  return allowedTypes.map((t) => map[t]).filter(Boolean);
}

function convertField(key, attr, where) {
  const base = {};
  if (attr.required) base.required = true;
  // Blocks fields can't be translatable in Storyblok; the fields inside the blocks are.
  const isBloks = attr.type === "component" || attr.type === "dynamiczone";
  if (attr.pluginOptions?.i18n?.localized && !isBloks) base.translatable = true;
  if (attr.default !== undefined && typeof attr.default !== "object") {
    base.default_value = String(attr.default);
  }

  switch (attr.type) {
    case "string":
    case "email":
      return { type: "text", ...base };
    case "uid":
      warn(where, `"${key}" is a Strapi uid; Storyblok stories already have a slug`);
      return { type: "text", ...base };
    case "text":
      return { type: "textarea", ...base };
    case "richtext":
    case "blocks":
      return { type: "richtext", ...base };
    case "customField":
      if (attr.customField?.includes("RichText")) return { type: "richtext", ...base };
      warn(where, `"${key}" custom field ${attr.customField} mapped to text`);
      return { type: "text", ...base };
    case "integer":
    case "biginteger":
    case "decimal":
    case "float":
      return { type: "number", ...base };
    case "boolean":
      return { type: "boolean", ...base };
    case "date":
      return { type: "datetime", disable_time: true, ...base };
    case "datetime":
    case "time":
      return { type: "datetime", ...base };
    case "enumeration":
      return {
        type: "option",
        options: attr.enum.map((v) => ({ name: v.trim(), value: v.trim() })),
        ...base,
        ...(base.default_value && { default_value: base.default_value.trim() }),
      };
    case "media": {
      const filetypes = assetFiletypes(attr.allowedTypes);
      return {
        type: attr.multiple ? "multiasset" : "asset",
        ...(filetypes && { filetypes }),
        ...base,
      };
    }
    case "json":
      warn(where, `"${key}" is JSON; stored as a textarea (consider structured fields)`);
      return { type: "textarea", description: "JSON value", ...base };
    case "component":
      return {
        type: "bloks",
        restrict_components: true,
        component_whitelist: [technicalName(attr.component)],
        ...(!attr.repeatable && { maximum: 1 }),
        ...base,
      };
    case "dynamiczone":
      return {
        type: "bloks",
        restrict_components: true,
        component_whitelist: attr.components.map(technicalName),
        ...base,
      };
    case "relation": {
      if (attr.mappedBy && !KEEP_INVERSE_RELATIONS.has(`${where}.${key}`)) {
        // Inverse side of a two-way relation; the owning content type stores it.
        warn(where, `"${key}" skipped (inverse of ${attr.target} -> ${attr.mappedBy})`);
        return null;
      }
      const many = /ToMany$/.test(attr.relation);
      return {
        type: many ? "options" : "option",
        source: "internal_stories",
        filter_content_type: [technicalName(attr.target)],
        ...base,
      };
    }
    default:
      warn(where, `"${key}" has unsupported type "${attr.type}", skipped`);
      return null;
  }
}

function convertSchema({ kind, name, category, schema }) {
  const fields = {};
  let pos = 0;
  for (const [key, attr] of Object.entries(schema.attributes ?? {})) {
    if (key === "component" || key.startsWith("_")) {
      warn(name, `field "${key}" uses a reserved Storyblok name, skipped`);
      continue;
    }
    const field = convertField(key, attr, name);
    if (field) fields[key] = { pos: pos++, ...field };
  }

  const isContentType = kind === "collectionType" || kind === "singleType";
  return {
    name,
    display_name: schema.info?.displayName || titleCase(name),
    is_root: isContentType,
    is_nestable: !isContentType,
    group: isContentType
      ? kind === "singleType"
        ? GROUP_SINGLE
        : GROUP_COLLECTION
      : titleCase(category),
    schema: fields,
  };
}

// ---------- Storyblok Management API ----------

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

async function push(components) {
  const mapi = mapiClient();

  const { component_groups: groups } = await mapi("GET", "/component_groups");
  const groupUuid = new Map(groups.map((g) => [g.name, g.uuid]));
  for (const name of new Set(components.map((c) => c.group))) {
    if (groupUuid.has(name)) continue;
    const { component_group } = await mapi("POST", "/component_groups", {
      component_group: { name },
    });
    groupUuid.set(name, component_group.uuid);
    console.log(`+ folder  ${name}`);
  }

  const { components: existing } = await mapi("GET", "/components");
  const existingByName = new Map(existing.map((c) => [c.name, c]));

  for (const { group, ...component } of components) {
    const current = existingByName.get(component.name);
    if (current) {
      // Changes made in the Storyblok UI win (e.g. a field switched to rich
      // text, fields added there); only fields missing in Storyblok are added.
      const added = Object.keys(component.schema).filter((key) => !current.schema[key]);
      if (!added.length) continue;
      const maxPos = Math.max(-1, ...Object.values(current.schema).map((f) => f.pos ?? 0));
      const schema = { ...current.schema };
      added.forEach((key, i) => (schema[key] = { ...component.schema[key], pos: maxPos + 1 + i }));
      await mapi("PUT", `/components/${current.id}`, { component: { ...current, schema } });
      console.log(`~ updated ${component.name} (+${added.join(", ")})`);
    } else {
      const body = { component: { ...component, component_group_uuid: groupUuid.get(group) } };
      await mapi("POST", "/components", body);
      console.log(`+ created ${component.name}`);
    }
  }
}

// ---------- main ----------

const strapi = await loadStrapiSchemas();
const components = strapi.map(convertSchema);

const names = components.map((c) => c.name);
const dupes = names.filter((n, i) => names.indexOf(n) !== i);
if (dupes.length) throw new Error(`Duplicate block names: ${[...new Set(dupes)].join(", ")}`);

for (const c of components) {
  for (const [key, field] of Object.entries(c.schema)) {
    for (const ref of field.component_whitelist ?? []) {
      if (!names.includes(ref)) warn(c.name, `"${key}" allows unknown block "${ref}"`);
    }
  }
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });
for (const c of components) {
  await writeFile(path.join(OUT_DIR, `${c.name}.json`), JSON.stringify(c, null, 2) + "\n");
}

const roots = components.filter((c) => c.is_root).length;
console.log(`Converted ${roots} content types + ${components.length - roots} nestable blocks -> ${OUT_DIR}`);

if (warnings.length) {
  console.log(`\nReview (${warnings.length}):`);
  for (const w of warnings) console.log(`  - ${w}`);
}

if (PUSH) {
  console.log("\nPushing to Storyblok...");
  await push(components);
  console.log("Done.");
} else {
  console.log("\nDry run. Re-run with --push to create the blocks in Storyblok.");
}
