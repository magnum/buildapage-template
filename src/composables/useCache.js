/**
 * Cache async data in localStorage with TTL. Bust with ?nocache (presence only).
 * Disable entirely with VITE_CACHE=0 at build time.
 * Stored shape: { at: number (ms epoch), data: unknown }.
 */
const DEFAULT_TTL_SECONDS = 3600

function isCacheOff() {
  return import.meta.env.VITE_CACHE === '0'
}

function getTtlSeconds() {
  const raw = import.meta.env.VITE_CACHE_TIMEOUT_SECONDS
  if (raw === undefined || raw === '') return DEFAULT_TTL_SECONDS
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return DEFAULT_TTL_SECONDS
  return n
}

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

export function useCache() {
  const PREFIX = 'CACHE'
  const ttlSeconds = getTtlSeconds()
  const cacheOff = isCacheOff()

  function shouldNocache() {
    return new URLSearchParams(window.location.search).has('nocache')
  }

  /**
   * @param {string} key - localStorage key
   * @param {import('vue').Ref} valueRef - ref filled from cache or from compute()
   * @param {() => Promise<unknown>} compute - loads fresh data when cache misses
   */
  async function doCache(key, valueRef, compute) {
    if (cacheOff) {
      console.log(PREFIX, `OFF, fetch "${key}"`)
      valueRef.value = await compute()
      return
    }

    if (shouldNocache()) {
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
      console.log(PREFIX, `nocache: cleared "${key}"`)
    }

    const raw = localStorage.getItem(key)
    if (raw != null) {
      try {
        const parsed = JSON.parse(raw)
        const envelope = readEnvelope(parsed)
        if (envelope && !isStale(envelope.at, ttlSeconds)) {
          valueRef.value = envelope.data
          console.log(PREFIX, `HIT "${key}"`)
          return
        }
        if (envelope && isStale(envelope.at, ttlSeconds)) {
          console.log(PREFIX, `MISS "${key}" (expired, ttl ${ttlSeconds}s)`)
        } else {
          console.log(PREFIX, `MISS "${key}" (invalid or legacy entry)`)
        }
      } catch {
        console.log(PREFIX, `MISS "${key}" (invalid JSON)`)
        try {
          localStorage.removeItem(key)
        } catch {
          /* ignore */
        }
      }
    } else {
      console.log(PREFIX, `cache miss "${key}" (empty)`)
    }

    const data = await compute()
    valueRef.value = data
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ at: Date.now(), data }),
      )
    } catch (e) {
      console.warn(PREFIX, 'setItem failed', e)
    }
  }

  return { doCache }
}
