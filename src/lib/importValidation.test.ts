import { describe, expect, it } from 'vitest'
import { sanitizeSpreadsheetCell, validateImportFile } from './importValidation'

describe('import validation', () => {
  it('rejects executable spreadsheet prefixes', () => {
    expect(sanitizeSpreadsheetCell('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)")
    expect(sanitizeSpreadsheetCell('+unsafe')).toBe("'+unsafe")
  })

  it('accepts a supported small import file', () => {
    const checks = validateImportFile({ name: 'asset-performance.xlsx', size: 2048 })
    expect(checks).toHaveLength(1)
    expect(checks[0].level).toBe('ok')
  })

  it('reports unsupported and oversized files', () => {
    const checks = validateImportFile({ name: 'video.mp4', size: 51 * 1024 * 1024 })
    expect(checks.filter((check) => check.level === 'error')).toHaveLength(2)
  })
})
