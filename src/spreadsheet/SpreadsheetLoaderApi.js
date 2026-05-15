/**
 * Loads sheet rows via Google Sheets API v4 (`values.get`).
 * Sheet must be readable with the API key (e.g. link-shared).
 */
export class SpreadsheetLoaderApi {
  /**
   * @param {{ spreadsheetId: string, apiKey: string, range?: string }} options
   * @param {string} [options.range='items!A1:D10'] A1 notation range including sheet name
   */
  constructor({ spreadsheetId, apiKey, range = 'items!A1:D10' }) {
    this.spreadsheetId = spreadsheetId
    this.apiKey = apiKey
    this.range = range
  }

  async load() {
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
}
