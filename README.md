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
| `REPO_URL` | Optional. Git remote URL if you extend **`npm run deploy`** with `gh-pages --repo` (see `.env.sample`). Not read by the default deploy script. |

**Cache:** **`SpreadsheetDataGViz`** and **`SpreadsheetLoaderApi`** persist **`load()`** results in **`localStorage`** (default TTL **30s** via constructor `timeout` or per call `load({ timeout: 600 })`). Default storage key is `spreadsheetId-sheetName` (Gviz) or `spreadsheetId-range` (API). Per call you can pass `key`, `noCache: true` (skip read/write), or `cacheClear: true` (drop entry for that key then fetch).

**Do not commit `.env`** — it is listed in `.gitignore`.

### Local development

```bash
npm run dev
```

## Standalone bundle: `SpreadsheetDataGViz`

The production build also outputs an **IIFE** at **`utils/spreadsheetLoaderGviz.js`** (see `vite.gviz-utility.config.js`). It defines the global **`SpreadsheetDataGViz`** constructor (same logic as `src/spreadsheet/spreadsheetLoaderGviz.js`).

**Deployed example (this template):**  
`https://magnum.github.io/buildapage-template/utils/spreadsheetLoaderGviz.js`  
If you host elsewhere, swap the origin and path prefix to match your **`VITE_BASE_PATH`** (e.g. `https://<user>.github.io/<repo>/utils/spreadsheetLoaderGviz.js`).

That file is only produced by **`npm run build`**; during **`npm run dev`** use **`npm run preview`** after a build, or load the script from a deployed URL.

### Using a `<script>` tag

Add the script, then run your code in a second tag (or a module script after load):

```html
<script src="https://magnum.github.io/buildapage-template/utils/spreadsheetLoaderGviz.js"></script>
<script>
  const loader = new SpreadsheetDataGViz({
    spreadsheetId: '1bp0t2aDrg03X0cWZX5TlU0ZP7U2qvwF2YgIqVK_7pIo',
    sheetName: 'items',
    query: null,
  });
  loader.load().then((rows) => console.log(rows));
</script>
```

With **`async`** on the first script you must wait for `load` before using the class (e.g. `defer` on both or a single inline listener).

### Using SpreadsheetDataGViz in the browser console

Open DevTools on any tab. Paste **the whole block** below and press Enter (modern consoles support top-level **`await`**). It loads the bundle, fetches the sheet, and prints the rows.

```js
await new Promise((done, fail) => {
  const s = document.createElement('script');
  s.src = 'https://magnum.github.io/buildapage-template/utils/spreadsheetLoaderGviz.js';
  s.onload = done;
  s.onerror = fail;
  document.head.appendChild(s);
});

const loader = new SpreadsheetDataGViz({
  spreadsheetId: '1bp0t2aDrg03X0cWZX5TlU0ZP7U2qvwF2YgIqVK_7pIo',
  sheetName: 'items',
  query: null,
});
const rows = await loader.load();
console.log(rows);
```

Running it again re-appends the script (harmless) and fetches fresh data.

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
| `npm run build` | Production app + **`dist/utils/spreadsheetLoaderGviz.js`** (IIFE) |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | `vite build` then `gh-pages -d dist` (configure `VITE_BASE_PATH` in `.env`) |

## License

[MIT](LICENSE)
