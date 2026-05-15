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

    let clearedByFlag = false
    if (cacheClear) {
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
      clearedByFlag = true
      console.log(LOG, 'CLEAR', key)
    }

    if (noCache) {
      console.log(LOG, 'MISS', key, '(noCache)')
      return compute()
    }

    const raw = localStorage.getItem(key)
    if (raw != null) {
      try {
        const envelope = readEnvelope(JSON.parse(raw))
        if (envelope && !isStale(envelope.at, ttlSeconds)) {
          console.log(LOG, 'HIT', key)
          return envelope.data
        }
        if (envelope && isStale(envelope.at, ttlSeconds)) {
          console.log(LOG, 'MISS', key, `(expired, ttl ${ttlSeconds}s)`)
        } else {
          console.log(LOG, 'MISS', key, '(invalid envelope)')
        }
      } catch {
        console.log(LOG, 'MISS', key, '(invalid JSON)')
        try {
          localStorage.removeItem(key)
        } catch {
          /* ignore */
        }
      }
    } else {
      console.log(LOG, 'MISS', key, clearedByFlag ? '(cleared)' : '(empty)')
    }

    const data = await compute()
    try {
      localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }))
    } catch (e) {
      console.warn(LOG, 'setItem failed', key, e)
    }
    return data
  }
}
