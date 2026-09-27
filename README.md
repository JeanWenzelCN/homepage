# Homepage

Dark, minimal, gallery-style portfolio site (inspired by christopherirelandcreative.com), deployable on **Cloudflare Pages** with **KV-backed content** editable via a built-in admin panel.

## Stack

- Static front-end in `public/` (no build step)
- Cloudflare Pages Functions in `functions/api/` provide `/api/config`
- Cloudflare KV (`HOMEPAGE_KV`) stores the whole site config as one JSON document
- Admin key lives in a Cloudflare environment variable (`ADMIN_KEY`) — never in the repo

## Structure

```
├── wrangler.toml
├── public/
│   ├── index.html      # public site
│   ├── admin.html      # admin panel (/admin.html)
│   ├── css/{main,admin}.css
│   └── js/{main,admin}.js
└── functions/
    └── api/config.js   # GET/PUT /api/config, Bearer auth, KV read/write
```

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/config` | none (optional Bearer probe) | Returns site config; falls back to built-in defaults when KV is empty |
| PUT | `/api/config` | `Authorization: Bearer <ADMIN_KEY>` | Validates JSON body, writes it to KV |

## Deploy

### Option A — Git integration (recommended)

1. Push this repo to GitHub.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
   - Build command: *(empty)*
   - Build output directory: `public`
3. Create the KV namespace:
   ```sh
   wrangler kv namespace create HOMEPAGE_KV
   ```
   Copy the returned `id` into `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "HOMEPAGE_KV"
   id = "<your-kv-namespace-id>"
   ```
   (or bind it in the dashboard: **Settings → Functions → KV namespace bindings**)
4. Set the admin secret: **Settings → Environment variables → Add variable**:
   - Name: `ADMIN_KEY`
   - Value: a long random string (e.g. `openssl rand -hex 32`)
5. Deploy. The site will serve defaults until you save content from the admin panel.

### Option B — Wrangler CLI

```sh
npm i -g wrangler
wrangler login
wrangler kv namespace create HOMEPAGE_KV
# put the id into wrangler.toml
wrangler pages deploy public --project-name homepage
wrangler pages secret put ADMIN_KEY --project-name homepage
```

> Note: KV namespace IDs cannot be created fully automatically on first deploy;
> creating the namespace and setting `ADMIN_KEY` are one-time manual steps
> (dashboard or CLI). After that, everything (content, design copy, links,
> works, footer) is editable from `/admin.html`.

## Admin panel

Open `https://<your-domain>/admin.html`, enter the `ADMIN_KEY`, edit any tab
(Site / Hero / Navigation / Sections / Works / Footer / Raw JSON), then
**Save All**. The key is kept in `sessionStorage` only.

## Local development

```sh
wrangler pages dev public --kv HOMEPAGE_KV
```
