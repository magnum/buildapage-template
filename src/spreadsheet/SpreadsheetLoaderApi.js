/**
 * Loads sheet rows via Google Sheets API v4 (`values.get`).
 * Sheet must be readable with the API key (e.g. link-shared).
 */
import { SpreadsheetLoaderCache } from './SpreadsheetLoaderCache.js'

export class SpreadsheetLoaderApi {
  /**
   * @param {{ spreadsheetId: string, apiKey: string, range?: string, timeout?: number }} options
   * @param {string} [options.range='items!A1:D10'] A1 notation range including sheet name
   * @param {number} [options.timeout=30] Default cache TTL in seconds
   */
  constructor({ spreadsheetId, apiKey, range = 'items!A1:D10', timeout = 30 }) {
    this.spreadsheetId = spreadsheetId
    this.apiKey = apiKey
    this.range = range
    this.timeout = timeout
  }

  /** Default cache key: `spreadsheetId-range` (no separate sheet name for API). */
  defaultCacheKey() {
    return `${this.spreadsheetId}-${this.range}`
  }

  async fetchUncached() {
    const { spreadsheetId, apiKey, range } = this
    const path = encodeURIComponent(range)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${path}?key=${apiKey}`
    const response = await fetch(url)
    const json = await response.json()
    if (!response.ok) {
      throw new Error(json.error?.message ?? 'Sheets API request failed')
    }
    const values = json.values
    if (!values?.length) return []
    const keys = values.shift()
    return values.map((row) =>
      Object.fromEntries(keys.map((k, i) => [k, row[i] ?? ''])),
    )
  }

  /**
   * @param {{ timeout?: number, key?: string, noCache?: boolean, cacheClear?: boolean }} [opts]
   */
  async load(opts = {}) {
    const key = opts.key ?? this.defaultCacheKey()
    const ttlSeconds = opts.timeout ?? this.timeout
    return SpreadsheetLoaderCache.get({
      key,
      ttlSeconds,
      noCache: opts.noCache,
      cacheClear: opts.cacheClear,
      compute: () => this.fetchUncached(),
    })
  }
}
