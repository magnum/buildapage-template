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

Caching for **`SpreadsheetDataGViz`** and **`SpreadsheetLoaderApi`** is described in **[Sheet loader cache](#sheet-loader-cache)**.

**Do not commit `.env`** — it is listed in `.gitignore`.

### Local development

```bash
npm run dev
```

## Sheet loader cache

**`SpreadsheetDataGViz`** and **`SpreadsheetLoaderApi`** store the result of **`load()`** in the browser’s **`localStorage`** so repeat visits avoid hitting Google on every call. The helper is **`SpreadsheetLoaderCache`** (`src/spreadsheet/SpreadsheetLoaderCache.js`); you normally only use **`load()`** on the loaders.

### Defaults

| | |
|---|---|
| **TTL** | **30 seconds** after a successful fetch. Configurable per instance: `new SpreadsheetDataGViz({ …, timeout: 120 })`, or per call: `load({ timeout: 600 })`. |
| **Storage key** | If you omit **`load({ key: '…' })`**, the key is derived automatically: **`${spreadsheetId}-${sheetName}`** for **Gviz**, and **`${spreadsheetId}-${range}`** for the **API** (e.g. `items!A1:D10`). Use an explicit **`key`** when several loaders share the same sheet but need separate cache entries. |

### Payload shape

Each key stores a small JSON object: **`{ at: <timestamp ms>, data: <rows> }`**. If the entry is missing, invalid, or **older than the TTL**, **`load()`** fetches again and overwrites the key.

### Per-call options

All are optional; **`load()`** with no argument uses only the defaults above.

| Option | Effect |
|--------|--------|
| **`timeout`** | TTL in **seconds** for this call only (defaults to the constructor’s **`timeout`**, normally **30**). |
| **`key`** | **`localStorage`** key for this call; if omitted, the automatic key for that loader is used. |
| **`cacheClear: true`** | Removes the entry for the resolved key (explicit or automatic), then fetches and, unless **`noCache`** is set, writes a fresh entry. Use this to **invalidate** cache for that key. |
| **`noCache: true`** | **Skips** reading and writing cache for this invocation only: always fetches from the network and does not update **`localStorage`**. |

`cacheClear` and **`noCache`** can target the same logical sheet either by relying on the **default key** or by passing the same **`key`** you used before.

### Console logging

Messages are prefixed with **`[SpreadsheetLoaderCache]`**. The storage **key** is always passed as the next argument: **`HIT`**, **`MISS`** (with a reason such as **`empty`**, **`expired, ttl …s`**, **`noCache`**, **`cleared`**, **`invalid JSON`**, **`invalid envelope`**), and **`CLEAR`** after **`cacheClear`**.

### Standalone script

The deployed **`utils/spreadsheetLoaderGviz.js`** bundle includes the same caching and **the same console logging** as the app.

## Standalone bundle: `SpreadsheetDataGViz`

The production build also outputs an **IIFE** at **`utils/spreadsheetLoaderGviz.js`** (see `vite.gviz-utility.config.js`). It defines the global **`SpreadsheetDataGViz`** constructor (same logic as `src/spreadsheet/spreadsheetLoaderGviz.js`).

**Deployed example (this template):**  
`https://builda.page/utils/spreadsheetLoaderGviz.js`  

If you fork or deploy under another origin or subpath, swap **`src`** so it matches your **`VITE_BASE_PATH`** (e.g. `https://<user>.github.io/<repo>/utils/spreadsheetLoaderGviz.js` for a GitHub Pages project site).

That file is only produced by **`npm run build`**; during **`npm run dev`** use **`npm run preview`** after a build, or load the script from a deployed URL.

### Drop-in HTML (any page)

Load the IIFE first, then an inline script. Browsers run **`defer`-less** classic scripts in order, so the global **`SpreadsheetDataGViz`** exists before your code runs. An **async IIFE** lets you use **`await`** on **`load()`** without marking the whole page script as `type="module"`:

```html
<script src="https://builda.page/utils/spreadsheetLoaderGviz.js"></script>
<script>
  (async () => {
    const loader = new SpreadsheetDataGViz({
      spreadsheetId: '1bp0t2aDrg03X0cWZX5TlU0ZP7U2qvwF2YgIqVK_7pIo',
      sheetName: 'items',
      query: null,
    });

    const rows = await loader.load();
    console.log(rows);
  })();
</script>
```

Swap the **`src`** if you host under another base URL (see above). **`load()`** uses the same **30s `localStorage` cache** and default key as in the app ([Sheet loader cache](#sheet-loader-cache)); use **`load({ noCache: true })`** or **`load({ cacheClear: true })`** when needed.

**Alternative** without `async`/`await` (Promise only):

```html
<script src="https://builda.page/utils/spreadsheetLoaderGviz.js"></script>
<script>
  const loader = new SpreadsheetDataGViz({
    spreadsheetId: '1bp0t2aDrg03X0cWZX5TlU0ZP7U2qvwF2YgIqVK_7pIo',
    sheetName: 'items',
    query: null,
  });
  loader.load().then((rows) => console.log(rows));
</script>
```

If you add **`async`** to the first **`<script src>`**, you must wait for **`load`** before using **`SpreadsheetDataGViz`** (e.g. listen to **`onload`** on that tag, or use **`defer`** consistently).

### Using SpreadsheetDataGViz in the browser console

Open DevTools on any tab. Paste **the whole block** below and press Enter (modern consoles support top-level **`await`**). It loads the bundle, builds a loader, and runs **`load()`**.

**`load()`** with no arguments uses the **default cache**: TTL **30 seconds** (see [Sheet loader cache](#sheet-loader-cache)) and an automatic **`localStorage`** key **`${spreadsheetId}-${sheetName}`** for this sheet tab.

```js
await new Promise((done, fail) => {
  const s = document.createElement('script');
  s.src = 'https://builda.page/utils/spreadsheetLoaderGviz.js';
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

// await loader.load({ cacheClear: true }); // remove cached entry for this loader's key, then fetch and cache again
// await loader.load({ noCache: true });    // skip cache for this call only (no read, no write)
```

Re-running the block re-appends the script (harmless). A second **`loader.load()`** within **30s** returns cached data unless you use **`noCache`** or **`cacheClear`** (see comments above).

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
