const LOG = '[SpreadsheetLoaderCache]'

/**
 * @param {unknown} parsed
 * @returns {{ at: number, data: unknown } | null}
 */
function readEnvelope(parsed) {
  if (
    parsed &&
    typeof parsed === 'object' &&
    typeof parsed.at === 'number' &&
    'data' in parsed
  ) {
    return { at: parsed.at, data: parsed.data }
  }
  return null
}

function isStale(atMs, ttlSeconds) {
  return Date.now() - atMs > ttlSeconds * 1000
}

/**
 * localStorage TTL cache for sheet payloads. Used by API and Gviz loaders.
 */
export class SpreadsheetLoaderCache {
  /**
   * @param {{
   *   key: string
   *   ttlSeconds: number
   *   noCache?: boolean
   *   cacheClear?: boolean
   *   compute: () => Promise<unknown>
   * }} opts
   */
  static async get(opts) {
    const { key, ttlSeconds, noCache, cacheClear, compute } = opts

    if (cacheClear) {
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
    }

    if (noCache) {
      return compute()
    }

    const raw = localStorage.getItem(key)
    if (raw != null) {
      try {
        const envelope = readEnvelope(JSON.parse(raw))
        if (envelope && !isStale(envelope.at, ttlSeconds)) {
          return envelope.data
        }
      } catch {
        try {
          localStorage.removeItem(key)
        } catch {
          /* ignore */
        }
      }
    }

    const data = await compute()
    try {
      localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }))
    } catch (e) {
      console.warn(LOG, 'setItem failed', e)
    }
    return data
  }
}
