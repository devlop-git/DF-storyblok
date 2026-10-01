# df-storyblok-poc

Monorepo for the Storyblok frontends of our jewellery brands (Diamonds Factory, Austen & Blake).
Storyblok is hosted, so there is no CMS server to run — pages and blocks are managed at
https://app.storyblok.com, one space per brand. Product data comes from the Commerce (Node) APIs.

```
Storyblok space (per brand) ──content──▶ apps/<brand> (Next.js) ◀──data── Commerce APIs
```

## Layout

```
apps/
  diamondsfactory/   Next.js app, https://localhost:3000
  austenblake/       Next.js app, https://localhost:3001
    brand/config.js     name, logo text, phone, links, announcement bar, markets, currency, image hosts
    brand/overrides.js  brand-only Storyblok blocks (merged over the shared registry)
    src/app/            routes (thin files that use the shared routes) + globals.css (brand colours)
    src/components/     brand-only components
    .env.local          this brand's keys (see .env.example)
packages/
  ui/      @df/ui     shared components, Storyblok block registry + page types, shared routes
  core/    @df/core   Storyblok client, Commerce APIs, market/locale, helpers (buildSku, formatPrice, …)
  theme/   @df/theme  Tailwind brand colour tokens (bg-brand-primary, …) + base styles
tools/storyblok/      Strapi → Storyblok schema migration, space backup, block JSON
```

Shared code reads the brand with `import { brand } from "@brand/config"`; each app points
`@brand/*` at its own `brand/` folder (`next.config.mjs` → `turbopack.resolveAlias`), so every
build contains only its own brand.

## Getting started

1. `npm install` (once, at the root — links the workspaces)
2. Copy `apps/<brand>/.env.example` to `apps/<brand>/.env.local` and fill in
   (Storyblok **Preview** token, space ID, management token, region, Commerce API URLs).
3. Run a brand:

```bash
npm run dev:df          # Diamonds Factory  https://localhost:3000
npm run dev:ab          # Austen & Blake    https://localhost:3001
npm run dev:df:http     # same over plain http (no Visual Editor)
```

4. In each Storyblok space, set Settings → Visual Editor → preview URL to that app's https URL.

## Build & deploy

```bash
npm run build           # both apps (Turborepo skips apps whose inputs didn't change)
npm run build:df        # only Diamonds Factory  → apps/diamondsfactory/.next
npm run build:ab        # only Austen & Blake    → apps/austenblake/.next
npm run start:df        # / start:ab — run a production build
npm run lint            # all apps and packages
```

Deploy each app separately (e.g. one hosting project per brand pointing at `apps/<brand>`,
with that brand's environment variables). A change in `packages/` affects every brand —
build and check all of them; a change in `apps/<brand>` only affects that brand.

## Where code goes

| Change | Put it in |
| --- | --- |
| Component used by all brands | `packages/ui/…` |
| Component for one brand only | `apps/<brand>/src/components/` (+ register it in `apps/<brand>/brand/overrides.js` if it's a Storyblok block) |
| Text, links, phone, markets for one brand | `apps/<brand>/brand/config.js` |
| Colours for one brand | `apps/<brand>/src/app/globals.css` (`:root { --brand-*: … }`) |
| API calls, helpers | `packages/core/…` |
| A page only one brand has | `apps/<brand>/src/app/<route>/page.js` |

**Adding a brand:** copy `apps/austenblake` to `apps/<new-brand>`, change its `package.json`
name and port, `brand/config.js`, colours in `globals.css` and `.env.local`, then add
`dev:<x>` / `build:<x>` scripts in the root `package.json`.

## How pages work

- `/` shows the HomePage story for the site's market (`NEXT_PUBLIC_MARKET`).
- Every other story is served at its slug: `customer-care/valuations` → `/customer-care/valuations`.
- `/{category}/{subCategory}` = PLP (products from the Commerce API, layout from the PLP Page story).
- `/design/{slug}/{sku}` = PDP (product from the Commerce API, sections from the PDP Page story).
- Blocks map to components by technical name in `packages/ui/storyblok/index.js`.
- Draft content in development, published in production (override with `STORYBLOK_VERSION`).

## Strapi → Storyblok terms

| Strapi                    | Storyblok                                  |
| ------------------------- | ------------------------------------------ |
| Collection / Single type  | Content type block (e.g. `page`)           |
| Component / Dynamic zone  | Nestable block + a "Blocks" field (`body`) |
| Entry                     | Story                                      |
| Content-Type Builder      | Block Library                              |
| API token                 | Access token (Preview / Public)            |

## Migrating models from Strapi

`tools/storyblok/migrate-strapi-schema.mjs` converts the Strapi schema files into Storyblok blocks
(collection/single types → content types, components → nestable blocks, dynamic zones → Blocks fields).

```bash
npm run migrate:schema:df              # dry run: writes tools/storyblok/components/*.json
npm run migrate:schema:df -- --push    # create/update blocks in the DF space (safe to re-run)
npm run migrate:schema:ab -- --push    # same blocks into the Austen & Blake space
```

`--push` only adds what's missing — fields changed in the Storyblok UI are kept.

## Backups

Content lives on Storyblok's servers. To restore a single story, use its **version history**
in Storyblok; deleted stories go to the **trash** first. For everything else (a deleted field
or block, bulk mistakes, moving to another space), export the whole space into the repo:

```bash
npm run backup:df                    # tools/storyblok/backup/diamondsfactory/<date>/
npm run backup:ab                    # tools/storyblok/backup/austenblake/<date>/
npm run backup:df -- --with-assets   # also downloads the image files (not committed)
```

It exports blocks, block folders, every story (drafts included), image details and
datasources. Commit the JSON so git history also works as a content history.
