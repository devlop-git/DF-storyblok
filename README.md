# df-storyblok-poc

Next.js frontend for Storyblok (the equivalent of the `frontend/` folder in the Strapi project).
Storyblok is hosted, so there is no CMS server to run — pages and blocks are managed at
https://app.storyblok.com. Pages also pull data from our Node API.

```
Storyblok (hosted CMS)  ──content──▶  this app (Next.js)  ◀──data──  Node API
```

## Getting started

1. Copy `.env.example` to `.env.local` and fill in:
   - `STORYBLOK_DELIVERY_API_TOKEN` — Storyblok **Preview** token (Settings → Access Tokens)
   - `NODE_API_URL` (and `NODE_API_KEY` if needed)
2. `npm install`
3. `npm run dev:https` and open https://localhost:3000
4. In Storyblok, set Settings → Visual Editor → preview URL to `https://localhost:3000/`.

## How it works

- **Pages**: every story is served at its slug — `home` → `/`, `about` → `/about`.
  See `src/app/page.js` and `src/app/[...slug]/page.js`.
- **Blocks**: each block in the Storyblok Block Library maps to a component in
  `src/components/storyblok/`, registered by technical name in `src/components/storyblok/index.js`.
  To add a block: create it in the UI → add a component → register it.
- **Node API**: the `node_api_list` block (fields `title`, `endpoint`, `limit`) fetches from the
  Node API on the server via `src/lib/nodeApi.js`. Editors place it on any page.
- **Content version**: draft in development, published in production
  (override with `STORYBLOK_VERSION`). Published pages refresh every 60 seconds.

## Strapi → Storyblok terms

| Strapi                    | Storyblok                                  |
| ------------------------- | ------------------------------------------ |
| Collection / Single type  | Content type block (e.g. `page`)           |
| Component / Dynamic zone  | Nestable block + a "Blocks" field (`body`) |
| Entry                     | Story                                      |
| Content-Type Builder      | Block Library                              |
| API token                 | Access token (Preview / Public)            |

## Migrating models from Strapi

`scripts/migrate-strapi-schema.mjs` reads the Strapi schema files (`cms/src/api/**/schema.json` and
`cms/src/components/**`) and converts them to Storyblok blocks:
collection/single types → content type blocks, components → nestable blocks (one folder per category),
dynamic zones → Blocks fields limited to the same components.

```bash
npm run migrate:schema              # dry run: writes storyblok/components/*.json and lists items to review
npm run migrate:schema -- --push    # creates/updates the blocks in the space (safe to re-run)
```

`--push` needs `STORYBLOK_SPACE_ID`, `STORYBLOK_MANAGEMENT_TOKEN` and `STORYBLOK_REGION` in `.env.local`.

## Brands (Diamonds Factory, Austen & Blake)

One codebase, one deployment per brand. `NEXT_PUBLIC_BRAND` picks the brand:

- `src/brands/<brand>.js` — name, logo text, phone, links (ring size guide, price
  explainer), announcement bar, markets/languages, currency symbol, image hosts.
- `src/app/globals.css` — brand colours as CSS variables (`:root` = Diamonds Factory,
  `[data-brand="austenblake"]` = Austen & Blake). Components use them as Tailwind
  colours: `bg-brand-primary`, `text-brand-accent`, `border-brand-pdp`, …
- `src/brands/overrides.js` — replace a single Storyblok block for one brand; everything
  else stays shared.
- Each brand has its own Storyblok space (own content, editors, Visual Editor preview URL).

```bash
npm run dev:https        # Diamonds Factory, https://localhost:3000 (.env.local)
npm run dev:ab           # Austen & Blake,  https://localhost:3001 (.env.austenblake)
npm run build:ab         # builds into .next-austenblake
npm run migrate:schema:ab -- --push   # same blocks into the Austen & Blake space
```

Copy `.env.austenblake.example` to `.env.austenblake` and fill in **every** key (anything
missing falls back to the Diamonds Factory `.env.local`). In the Austen & Blake Storyblok
space, set the Visual Editor preview URL to `https://localhost:3001/`.

Austen & Blake's colours are placeholders until the real brand palette is provided.

## Backups

Content lives on Storyblok's servers (no local database like Strapi's `.tmp/data.db`).
To restore a single story, use its **version history** in Storyblok, and deleted stories
go to the **trash** first. For everything else (a deleted field or block, bulk mistakes,
moving to a company space), export the whole space into the repo:

```bash
npm run backup:storyblok                    # storyblok/backup/<date>/ as JSON
npm run backup:storyblok -- --with-assets   # also downloads the image files (not committed)
```

It exports blocks, block folders, every story (drafts included), image details and
datasources. Commit the JSON so git history also works as a content history. Needs
`STORYBLOK_SPACE_ID`, `STORYBLOK_MANAGEMENT_TOKEN` and `STORYBLOK_REGION` in `.env.local`.

## Versioning block schemas (optional)

Blocks live in Storyblok, not in this repo. To keep a copy in git, use the Storyblok CLI:

```bash
npx storyblok login
npx storyblok components pull --space <SPACE_ID>
```

Run `npx storyblok --help` for the exact options of your CLI version.
