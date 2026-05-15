# builda.page — Vue + Google Sheets template

A minimal web project template built with [Vue 3](https://vuejs.org/) and [Vite](https://vitejs.dev/). It loads tabular data from a **public** Google Spreadsheet: the default UI uses the **Visualization (gviz) JSON** endpoint (no API key). The **`SpreadsheetLoaderApi`** helper is available for the Sheets REST API with a key.

## Prerequisites

- Node.js 20+ (recommended; matches CI)
- For the default **gviz** loader: spreadsheet shared so **anyone with the link can view**.
- For **SpreadsheetLoaderApi** only: a [Google Cloud](https://console.cloud.google.com/) API key with **Google Sheets API** enabled and HTTP referrer restrictions as needed.

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
| `VITE_GOOGLE_API_KEY` | Only for **`SpreadsheetLoaderApi`**. Not used by default **`SpreadsheetDataGViz`** in `list.vue`. |
| `VITE_SPREADSHEET_ID` | Spreadsheet ID from the sheet URL (`…/d/<SPREADSHEET_ID>/edit`). |
| `VITE_SHEET_NAME` | Optional. Sheet tab name for **gviz** (default **`items`**). |
| `VITE_BASE_PATH` | **Production `base` URL** for assets (see `vite.config.js`). Use a path with slashes, e.g. `/my-repo/` for GitHub Pages project sites; use `/` for root deploys. In dev, Vite still serves at `/`. |
| `VITE_CACHE_TIMEOUT_SECONDS` | Optional. `localStorage` cache TTL in seconds (default **3600**). |
| `VITE_CACHE` | Optional. Set to **`0`** to disable client caching (always fetch; no `localStorage` read/write). |
| `REPO_URL` | Optional. Git remote URL if you extend **`npm run deploy`** with `gh-pages --repo` (see `.env.sample`). Not read by the default deploy script. |

**Do not commit `.env`** — it is listed in `.gitignore`.

### Local development

```bash
npm run dev
```

## GitHub Pages

1. In the repository on GitHub: **Settings → Pages**.
2. Set **Source** to **GitHub Actions** (this repo includes a workflow that builds and deploys on push to `main` / `master`).

In CI, set **`VITE_BASE_PATH`** to `/<repository-name>/` so asset paths match GitHub Pages project URLs (e.g. `https://<user>.github.io/<repo>/`).

### Serving from a subpath (custom base URL)

If the built site is **not** at the domain root (e.g. GitHub Pages project site), set **`VITE_BASE_PATH`** in `.env` (or in the build environment). `vite.config.js` reads **`process.env.VITE_BASE_PATH`** (via `dotenv`) for the **`base`** option.

Example:

```bash
VITE_BASE_PATH=/your-repo-name/ npm run build
```

Match the value to the path segment where the app is hosted, including leading and trailing slashes as in `.env.sample`.

## Deploy

**Option A — locally (pushes `dist` to `gh-pages` branch)**

```bash
npm run deploy
```

**`npm run deploy`** runs **`vite build`** (`.env` is loaded in `vite.config.js` via **`dotenv`**) then **`gh-pages -d dist`**. Configure **`VITE_BASE_PATH`** and spreadsheet env vars in `.env` before deploying. To push to a specific remote, add **`gh-pages --repo …`** to the script or pass **`REPO_URL`** from `.env` using a shell helper (see comment in `.env.sample`).

**Option B — CI**

Push to `main` or `master`; the **Deploy GitHub Pages** workflow builds and publishes automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | `vite build` then `gh-pages -d dist` (configure `VITE_BASE_PATH` in `.env`) |

## License

[MIT](LICENSE)
