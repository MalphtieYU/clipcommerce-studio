const FORMULA_PREFIX = /^[=+\-@]/
const allowedExtensions = new Set(['csv', 'xlsx', 'xls', 'json'])

export type ImportCheck = { level: 'error' | 'warning' | 'ok'; message: string }

export function sanitizeSpreadsheetCell(value: unknown) {
  if (typeof value !== 'string') return value
  return FORMULA_PREFIX.test(value.trim()) ? `'${value}` : value
}

export function validateImportFile(file: Pick<File, 'name' | 'size'>, maxMb = 50): ImportCheck[] {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const checks: ImportCheck[] = []
  if (!allowedExtensions.has(extension)) checks.push({ level: 'error', message: '只允许 CSV、XLSX、XLS 或 JSON 文件。' })
  if (file.size > maxMb * 1024 * 1024) checks.push({ level: 'error', message: `文件超过 ${maxMb}MB 本地限制。` })
  if (!checks.length) checks.push({ level: 'ok', message: '文件类型与大小校验通过；仍需字段映射和人工确认。' })
  return checks
}

export function describeMissing(value: number | null | undefined) {
  return value === null || value === undefined ? '—（缺少数据）' : String(value)
}
