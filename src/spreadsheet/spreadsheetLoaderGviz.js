/**
 * Loads via the public Google Visualization "tq" endpoint (no API key).
 * Works for spreadsheets published / accessible to "anyone with the link".
 */

function parseGvizResponseBody(text) {
  const m = text.match(/setResponse\(([\s\S]*)\);?\s*$/)
  if (!m) {
    throw new Error('Unexpected gviz response (no setResponse)')
  }
  return JSON.parse(m[1])
}

export class SpreadsheetDataGViz {
  /**
   * @param {{
   *   spreadsheetId: string
   *   sheetName: string
   *   query?: string | null
   * }} options
   */
  constructor({ spreadsheetId, sheetName, query = null }) {
    this.spreadsheetId = spreadsheetId
    this.sheetName = sheetName
    this.query = query
  }

  async load() {
    const { spreadsheetId, sheetName, query } = this
    let url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
    if (query) url += `&tq=${encodeURIComponent(query)}`

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`gviz request failed: ${res.status}`)
    }
    const text = await res.text()
    const json = parseGvizResponseBody(text)

    const cols = json.table.cols.map((c) => c.label || c.id)
    return json.table.rows.map((row) => {
      const obj = {}
      const cells = row.c || []
      cells.forEach((cell, i) => {
        let value = cell ? cell.v : null
        if (typeof value === 'string' && value.startsWith('Date(')) {
          const parts = value.match(/\d+/g)
          if (parts?.length >= 3) {
            const [y, m, d] = parts.map(Number)
            value = new Date(y, m, d)
          }
        }
        obj[cols[i]] = value
      })
      return obj
    })
  }
}
