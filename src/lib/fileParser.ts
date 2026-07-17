import Papa from 'papaparse'
import { localApi } from './api'

export type ParsedLocalFile = {
  sourceType: 'csv' | 'xlsx'
  headers: string[]
  rows: Record<string, unknown>[]
  warnings: string[]
}

const maxBytes = 50 * 1024 * 1024
const maxRows = 10000
const maxColumns = 40
const dangerousPrefix = /^[=+@]|^-(?!\d+(?:\.\d+)?$)/

function assertFileBasics(file: File) {
  if (file.size === 0) throw new Error('文件为空')
  if (file.size > maxBytes) throw new Error('文件超过 50MB 限制')
  const extension = file.name.toLowerCase().split('.').pop()
  if (!extension || !['csv', 'xlsx'].includes(extension)) throw new Error('仅支持 CSV 和 XLSX 文件')
  const allowedMime = extension === 'csv'
    ? ['', 'text/csv', 'text/plain', 'application/vnd.ms-excel']
    : ['', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream', 'application/zip']
  if (!allowedMime.includes(file.type)) throw new Error(`文件 MIME 类型与 .${extension} 不匹配`)
  return extension as 'csv' | 'xlsx'
}

function assertHeaders(headers: string[]) {
  if (!headers.length) throw new Error('未检测到表头')
  if (headers.length > maxColumns) throw new Error(`列数超过 ${maxColumns} 列限制`)
  if (headers.some((header) => !header.trim())) throw new Error('存在空白表头')
  const normalized = headers.map((header) => header.trim().toLowerCase())
  if (new Set(normalized).size !== normalized.length) throw new Error('存在重复列名')
}

function assertRows(rows: Record<string, unknown>[]) {
  if (!rows.length) throw new Error('文件没有数据行')
  if (rows.length > maxRows) throw new Error(`数据行超过 ${maxRows.toLocaleString()} 行限制`)
  for (const [index, row] of rows.entries()) {
    for (const [field, value] of Object.entries(row)) {
      if (typeof value === 'string' && dangerousPrefix.test(value.trimStart())) {
        throw new Error(`第 ${index + 2} 行「${field}」包含公式注入风险前缀`)
      }
    }
  }
}

async function parseCsv(file: File): Promise<ParsedLocalFile> {
  const text = await file.text()
  if (!text.trim()) throw new Error('CSV 文件为空')
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: 'greedy' })
  if (parsed.errors.length) throw new Error(`CSV 解析失败：${parsed.errors[0].message}`)
  const [headerRow = [], ...dataRows] = parsed.data
  const headers = headerRow.map((value) => String(value ?? '').trim())
  assertHeaders(headers)
  const rows = dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] === '' ? null : values[index] ?? null])))
  assertRows(rows)
  return { sourceType: 'csv', headers, rows, warnings: [] }
}

async function parseXlsx(file: File): Promise<ParsedLocalFile> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('读取 XLSX 文件失败'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
  const contentBase64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return localApi.imports.parseXlsx({ filename: file.name, mimeType: file.type, contentBase64 })
}

export async function parseLocalImportFile(file: File): Promise<ParsedLocalFile> {
  const extension = assertFileBasics(file)
  try {
    return extension === 'csv' ? await parseCsv(file) : await parseXlsx(file)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : '文件解析失败')
  }
}

export function sanitizeSpreadsheetCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value)
  return dangerousPrefix.test(text.trimStart()) ? `'${text}` : text
}
