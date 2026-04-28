# builda.page — Vue + Google Sheets template

A minimal web project template built with [Vue 3](https://vuejs.org/) and [Vite](https://vitejs.dev/). It loads tabular data from a **public** Google Spreadsheet via the [Google Sheets API](https://developers.google.com/sheets/api) (API key only, no backend).

## Prerequisites

- Node.js 20+ (recommended; matches CI)
- A [Google Cloud](https://console.cloud.google.com/) project with **Google Sheets API** enabled
- An API key allowed for your origins (e.g. `http://localhost:5173/*` for local dev)
- The spreadsheet shared so **anyone with the link can view** (required for browser API-key access)

## Setup

```bash
npm i
```

Copy environment variables and fill in your values:

```bash
cp .env.sample .env
```

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_API_KEY` | Google API key (Sheets API enabled; restrict by HTTP referrer in production) |
| `VITE_SPREADSHEET_ID` | Spreadsheet ID from the sheet URL (`…/d/<SPREADSHEET_ID>/edit`) |

**Do not commit `.env`** — it is listed in `.gitignore`.

### Local development

```bash
npm run dev
```

## GitHub Pages

1. In the repository on GitHub: **Settings → Pages**.
2. Set **Source** to **GitHub Actions** (this repo includes a workflow that builds and deploys on push to `main` / `master`).

The workflow sets `VITE_BASE` to `/<repository-name>/` so asset paths match GitHub Pages project URLs (e.g. `https://<user>.github.io/<repo>/`).

### Serving from a subpath (custom base URL)

If the built site is **not** at the domain root (e.g. GitHub Pages project site), Vite must use the correct `base` path.

In `vite.config.js`, production `base` is taken from **`process.env.VITE_BASE`** at build time. Override it when building, for example:

```bash
VITE_BASE=/your-repo-name/ npm run build
```

Adjust the default in `vite.config.js` if you use this template as a starting point and your repo name differs from the fallback.

## Deploy

**Option A — locally (pushes `dist` to `gh-pages` branch)**

```bash
npm run deploy
```

Ensure `VITE_BASE` matches your GitHub Pages URL before running `build` (see above). The deploy script runs `npm run build` then `gh-pages`.

**Option B — CI**

Push to `main` or `master`; the **Deploy GitHub Pages** workflow builds and publishes automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build and deploy to `gh-pages` via `gh-pages` CLI |

## License

[MIT](LICENSE)
