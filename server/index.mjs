import { createServer } from 'node:http';
import { basename } from 'node:path';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';

process.env.DATABASE_URL ||= 'file:../data/sleepflow.db';
const prisma = new PrismaClient();
const host = '127.0.0.1';
const port = Number(process.env.SLEEPFLOW_API_PORT || 8787);
const maxBodyBytes = 70 * 1024 * 1024;
const maxImportBytes = 50 * 1024 * 1024;

const goalCategories = new Set(['ASSET_OUTPUT', 'GMV', 'SPEND', 'ROI', 'NEW_ASSET_GMV', 'SHOOT_COUNT', 'CREATOR_VIDEO', 'CUSTOM']);
const goalPriorities = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
const goalStatuses = new Set(['ON_TRACK', 'AT_RISK', 'BLOCKED', 'COMPLETE', 'PAUSED']);
const assetStatuses = new Set(['DRAFT', 'PENDING_EDIT', 'PENDING_PUBLISH', 'PUBLISHED', 'PROMOTING', 'OBSERVING', 'REPLICABLE', 'OPTIMIZE', 'PAUSED', 'RETIRED', 'INSUFFICIENT_DATA']);
const sourceTypes = new Set(['ORIGINAL', 'ITERATION', 'CREATOR', 'AI_ASSISTED', 'REEDIT', 'IMPORTED']);
const sourceTypeAliases = new Map([
  ['原创', 'ORIGINAL'], ['ORIGINAL', 'ORIGINAL'],
  ['迭代', 'ITERATION'], ['二创', 'ITERATION'], ['ITERATION', 'ITERATION'],
  ['达人', 'CREATOR'], ['CREATOR', 'CREATOR'],
  ['AI辅助', 'AI_ASSISTED'], ['AI 辅助', 'AI_ASSISTED'], ['AI_ASSISTED', 'AI_ASSISTED'],
  ['二次剪辑', 'REEDIT'], ['REEDIT', 'REEDIT'],
  ['导入', 'IMPORTED'], ['IMPORTED', 'IMPORTED'],
]);
const channelDefinitions = new Map([
  ['DOUYIN', '抖音'], ['TIKTOK_SHOP', 'TikTok Shop'], ['TMALL', '天猫'], ['JD', '京东'],
  ['SHOPIFY', 'Shopify'], ['META', 'Meta Ads'], ['YOUTUBE', 'YouTube / Google Ads'], ['AMAZON', 'Amazon'],
]);
const channelAliases = new Map([
  ['抖音', 'DOUYIN'], ['DOUYIN', 'DOUYIN'],
  ['TIKTOK', 'TIKTOK_SHOP'], ['TIKTOK SHOP', 'TIKTOK_SHOP'], ['TIKTOK_SHOP', 'TIKTOK_SHOP'],
  ['天猫', 'TMALL'], ['TMALL', 'TMALL'], ['淘宝', 'TMALL'],
  ['京东', 'JD'], ['JD', 'JD'], ['SHOPIFY', 'SHOPIFY'],
  ['META', 'META'], ['META ADS', 'META'], ['FACEBOOK', 'META'], ['INSTAGRAM', 'META'],
  ['YOUTUBE', 'YOUTUBE'], ['GOOGLE ADS', 'YOUTUBE'], ['AMAZON', 'AMAZON'],
]);
const normalizeChannel = (value) => {
  const name = nullableText(value);
  if (!name || name.length > 80) return null;
  const alias = channelAliases.get(name.toUpperCase()) || channelAliases.get(name);
  if (alias) return { code: alias, name: channelDefinitions.get(alias) || name };
  const suffix = [...name].map((character) => character.codePointAt(0).toString(36)).join('').slice(0, 34);
  return { code: `CUSTOM_${suffix}`, name };
};
const categoryAliases = new Map([
  ['素材产量', 'ASSET_OUTPUT'], ['ASSET_OUTPUT', 'ASSET_OUTPUT'],
  ['GMV', 'GMV'], ['消耗', 'SPEND'], ['SPEND', 'SPEND'],
  ['ROI', 'ROI'], ['新素材 GMV', 'NEW_ASSET_GMV'], ['NEW_ASSET_GMV', 'NEW_ASSET_GMV'],
  ['拍摄次数', 'SHOOT_COUNT'], ['拍摄', 'SHOOT_COUNT'], ['SHOOT_COUNT', 'SHOOT_COUNT'],
  ['达人视频', 'CREATOR_VIDEO'], ['CREATOR_VIDEO', 'CREATOR_VIDEO'], ['CUSTOM', 'CUSTOM'],
]);
const fieldAliases = {
  name: ['name', '目标名称'],
  category: ['category', '目标分类'],
  periodStart: ['periodStart', '周期开始', '报告周期开始'],
  targetValue: ['targetValue', '目标值'],
  assetCode: ['assetCode', '素材编号', 'material_id', '素材ID'],
  displayName: ['displayName', '素材名称', 'material_name', '素材名'],
  externalMaterialId: ['externalMaterialId', '外部素材ID', 'material_id'],
  durationSeconds: ['durationSeconds', '时长(秒)', '时长'],
  sourceType: ['sourceType', '素材来源'],
  productName: ['productName', '产品名称'],
  channel: ['channel', '渠道'],
  accountId: ['accountId', '账户 ID', '广告账户 ID'],
  campaignId: ['campaignId', 'campaign_name', 'campaign_id', '广告计划', '广告组', '广告系列'],
  statisticsStart: ['statisticsStart', '数据周期开始', 'statistics_start'],
  statisticsEnd: ['statisticsEnd', '数据周期结束', 'statistics_end'],
  orderCount: ['orderCount', '订单数', 'purchases', 'purchase_count'],
  transactionAmount: ['transactionAmount', '成交金额', '销售额', 'revenue'],
  spend: ['spend', '消耗'],
  paidRoi: ['paidRoi', '支付ROI', '支付 ROI', 'paid_roi'],
  totalRoi: ['totalRoi', '总 ROI', 'ROAS', 'roas'],
  gmv: ['gmv', '成交金额', '支付金额', 'GMV', 'transaction_amount'],
  cpm: ['cpm', 'CPM', '千次展示成本'],
  cpc: ['cpc', 'CPC', '平均点击成本'],
  cpa: ['cpa', 'CPA', '单次转化成本'],
  impressions: ['impressions', '展示数', '展现量'],
  plays: ['plays', '播放数', '播放量'],
  clicks: ['clicks', '点击数', '点击量'],
  productClicks: ['productClicks', '商品点击数', '商品点击量'],
  addToCart: ['addToCart', '加购数', '加购人数'],
  payments: ['payments', '支付数', '支付买家数', '支付订单数'],
  ctr: ['ctr', '点击率', 'CTR'],
  cvr: ['cvr', '转化率', 'CVR', '支付转化率'],
};
const typeFields = {
  'monthly-goals': ['name', 'category', 'periodStart', 'targetValue'],
  'asset-metadata': ['assetCode', 'displayName', 'externalMaterialId', 'durationSeconds', 'sourceType', 'productName', 'channel'],
  'asset-performance': ['assetCode', 'displayName', 'externalMaterialId', 'channel', 'accountId', 'campaignId', 'statisticsStart', 'statisticsEnd', 'orderCount', 'transactionAmount', 'spend', 'paidRoi', 'totalRoi', 'gmv', 'cpm', 'cpc', 'cpa', 'impressions', 'plays', 'clicks', 'productClicks', 'addToCart', 'payments', 'ctr', 'cvr'],
};

const json = (response, status, payload) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
};

const readJson = async (request) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      const error = new Error('请求内容超过 12MB 限制');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('请求 JSON 格式无效');
    error.status = 400;
    throw error;
  }
};

const routeId = (pathname, prefix, suffix = '') => {
  if (!pathname.startsWith(prefix) || (suffix && !pathname.endsWith(suffix))) return null;
  const end = suffix ? -suffix.length : undefined;
  const id = decodeURIComponent(pathname.slice(prefix.length, end)).replace(/^\/|\/$/g, '');
  return id && !id.includes('/') ? id : null;
};

const arrayValue = (value) => Array.isArray(value) ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : [];
const nullableText = (value) => typeof value === 'string' && value.trim() ? value.trim() : null;
const requiredText = (value, field) => {
  const text = nullableText(value);
  if (!text) {
    const error = new Error(`${field}不能为空`);
    error.status = 400;
    throw error;
  }
  return text;
};
const nullableNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
  const number = Number(normalized);
  if (!Number.isFinite(number)) return Number.NaN;
  return number;
};
const nullableDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const monthEnd = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
const safeFileReference = (value) => {
  const text = nullableText(value);
  if (!text) return null;
  if (text.includes('\0') || text.includes('..') || /^[a-z]+:/i.test(text) || /^[\\/]/.test(text)) {
    const error = new Error('文件引用必须是工作区内的相对安全引用');
    error.status = 400;
    throw error;
  }
  return text.replace(/\\/g, '/').slice(0, 240);
};
const audit = (action, entityType, entityId, summary, metadata = undefined) =>
  prisma.auditLog.create({ data: { action, entityType, entityId, actor: 'local-user', summary, metadata } });

const productPayload = (body) => ({
  name: requiredText(body.name, '产品名称'),
  model: nullableText(body.model),
  series: nullableText(body.series),
  brand: nullableText(body.brand),
  status: body.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_CONFIRMATION',
  confirmedClaims: arrayValue(body.confirmedClaims),
  pendingClaims: arrayValue(body.pendingClaims),
  prohibitedClaims: arrayValue(body.prohibitedClaims),
  colors: arrayValue(body.colors),
  sourceNote: nullableText(body.sourceNote) || '本地手动录入',
  verifiedAt: nullableDate(body.verifiedAt),
  verifiedBy: nullableText(body.verifiedBy),
});

const goalPayload = (body) => {
  const periodStart = nullableDate(body.periodStart);
  const periodEnd = nullableDate(body.periodEnd);
  if (!periodStart || !periodEnd || periodEnd < periodStart) {
    const error = new Error('目标周期无效');
    error.status = 400;
    throw error;
  }
  const category = categoryAliases.get(String(body.category || '').trim()) || body.category;
  if (!goalCategories.has(category)) {
    const error = new Error('目标分类无效');
    error.status = 400;
    throw error;
  }
  const targetValue = nullableNumber(body.targetValue);
  const currentValue = nullableNumber(body.currentValue);
  if (Number.isNaN(targetValue) || Number.isNaN(currentValue)) {
    const error = new Error('目标值与当前值必须为数字或空值');
    error.status = 400;
    throw error;
  }
  return {
    name: requiredText(body.name, '目标名称'),
    category,
    periodType: body.periodType === 'WEEKLY' || body.periodType === 'DAILY' ? body.periodType : 'MONTHLY',
    periodStart,
    periodEnd,
    targetValue,
    currentValue,
    progressRate: targetValue && currentValue !== null ? currentValue / targetValue : null,
    gapValue: targetValue !== null && currentValue !== null ? targetValue - currentValue : null,
    unit: requiredText(body.unit || '数值', '单位'),
    priority: goalPriorities.has(body.priority) ? body.priority : 'MEDIUM',
    status: goalStatuses.has(body.status) ? body.status : 'ON_TRACK',
    productId: nullableText(body.productId),
    channelId: nullableText(body.channelId),
    source: nullableText(body.source) || '本地手动录入',
    notes: nullableText(body.notes),
    lastUpdatedAt: new Date(),
  };
};

const assetPayload = (body) => {
  const assetCode = requiredText(body.assetCode, '素材编号').toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(assetCode)) {
    const error = new Error('素材编号仅允许 3–40 位字母、数字、下划线和连字符');
    error.status = 400;
    throw error;
  }
  const durationSeconds = nullableNumber(body.durationSeconds);
  if (Number.isNaN(durationSeconds) || (durationSeconds !== null && (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 86400))) {
    const error = new Error('素材时长必须是 0–86400 的整数或空值');
    error.status = 400;
    throw error;
  }
  return {
    assetCode,
    displayName: requiredText(body.displayName, '素材名称'),
    externalMaterialId: nullableText(body.externalMaterialId),
    originalFilename: nullableText(body.originalFilename),
    localFileReference: safeFileReference(body.localFileReference),
    thumbnailUrl: null,
    durationSeconds,
    sourceType: sourceTypes.has(body.sourceType) ? body.sourceType : 'ORIGINAL',
    productId: nullableText(body.productId),
    contentType: nullableText(body.contentType),
    status: assetStatuses.has(body.status) ? body.status : 'DRAFT',
    tags: arrayValue(body.tags),
  };
};

const canonicalHeader = (header) => {
  const text = String(header || '').trim();
  const match = text.match(/\(([^()]+)\)\s*$/);
  const candidate = match ? match[1].trim() : text;
  for (const [canonical, aliases] of Object.entries(fieldAliases)) {
    if (aliases.some((alias) => alias.toLowerCase() === candidate.toLowerCase())) return canonical;
  }
  return candidate;
};

const canonicalizeRows = (rows) => rows.map((row) => Object.fromEntries(
  Object.entries(row || {}).map(([key, value]) => [canonicalHeader(key), value]),
));

const formulaLike = (value) => {
  if (typeof value !== 'string') return false;
  const text = value.trimStart();
  if (!/^[=+\-@]/.test(text)) return false;
  if (/^-\d+(\.\d+)?$/.test(text)) return false;
  return true;
};

const decodeXml = (value) => String(value ?? '')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&');

const columnIndexFromReference = (reference = '') => {
  const letters = String(reference).match(/[A-Z]+/i)?.[0]?.toUpperCase();
  if (!letters) return null;
  return [...letters].reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0) - 1;
};

const xmlAttribute = (text, name) => {
  const match = String(text).match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return match?.[1] || '';
};

const xmlText = (xml) => [...String(xml).matchAll(/<(?:[\w.-]+:)?t\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?t>/gi)]
  .map((match) => decodeXml(match[1]))
  .join('');

const importSheetPriority = (name = '') => {
  const normalized = String(name).trim();
  if (normalized === '导入数据') return 0;
  if (/工作台.*导入.*测试|导入.*测试/.test(normalized)) return 1;
  if (/导入|数据/.test(normalized)) return 2;
  return 10;
};

const xmlHasFormula = (xml) => /<(?:[\w.-]+:)?f(?:\s|>)/i.test(xml);
const xmlHasHiddenStructure = (xml) => /<(?:[\w.-]+:)?(?:row|col)\b[^>]*\bhidden\s*=\s*["'](?:1|true)["']/i.test(xml);

const parsePrefixedXlsx = async (buffer) => {
  let zip;
  try {
    zip = await JSZip.loadAsync(buffer, { checkCRC32: true });
  } catch {
    const error = new Error('XLSX 文件损坏或无法解析');
    error.status = 422;
    throw error;
  }
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  if (entries.length === 0 || entries.length > 200) {
    const error = new Error('XLSX 文件结构异常');
    error.status = 422;
    throw error;
  }
  const readEntry = async (name, maximum = 20 * 1024 * 1024) => {
    const entry = zip.file(name);
    if (!entry) return '';
    const text = await entry.async('string');
    if (text.length > maximum) {
      const error = new Error('XLSX 工作表内容超过安全限制');
      error.status = 413;
      throw error;
    }
    return text;
  };
  const workbookXml = await readEntry('xl/workbook.xml', 1024 * 1024);
  if (!/<(?:[\w.-]+:)?workbook\b/i.test(workbookXml)) {
    const error = new Error('XLSX 文件缺少工作簿定义');
    error.status = 422;
    throw error;
  }
  const relationshipXml = await readEntry('xl/_rels/workbook.xml.rels', 1024 * 1024);
  const relationships = new Map([...relationshipXml.matchAll(/<(?:[\w.-]+:)?Relationship\b([^>]*)\/>/gi)]
    .map((match) => [xmlAttribute(match[1], 'Id'), xmlAttribute(match[1], 'Target')]));
  const sheets = [...workbookXml.matchAll(/<(?:[\w.-]+:)?sheet\b([^>]*)\/>/gi)]
    .map((match) => ({ name: xmlAttribute(match[1], 'name'), relationshipId: xmlAttribute(match[1], 'r:id'), state: xmlAttribute(match[1], 'state') }));
  const hiddenSheet = sheets.find((sheet) => sheet.state && sheet.state !== 'visible');
  if (hiddenSheet) {
    const error = new Error(`检测到隐藏工作表「${hiddenSheet.name}」；请取消隐藏并人工确认后再导入`);
    error.status = 422;
    throw error;
  }
  const candidates = sheets.map((sheet) => {
    const target = relationships.get(sheet.relationshipId || '');
    const path = target
      ? target.replace(/^\//, '').startsWith('xl/') ? target.replace(/^\//, '') : `xl/${target.replace(/^\//, '')}`
      : 'xl/worksheets/sheet1.xml';
    return { ...sheet, path };
  }).sort((left, right) => importSheetPriority(left.name) - importSheetPriority(right.name));
  let selectedSheet;
  let worksheetXml = '';
  for (const candidate of candidates) {
    const xml = await readEntry(candidate.path);
    if (xml && /<(?:[\w.-]+:)?worksheet\b/i.test(xml) && !xmlHasFormula(xml)) {
      selectedSheet = candidate;
      worksheetXml = xml;
      break;
    }
  }
  if (!worksheetXml || !/<(?:[\w.-]+:)?worksheet\b/i.test(worksheetXml)) {
    const error = new Error('未找到无公式的可导入工作表；请将需要导入的数据复制到无公式页签');
    error.status = 422;
    throw error;
  }
  if (xmlHasHiddenStructure(worksheetXml)) {
    const error = new Error('检测到隐藏行或列；请取消隐藏并人工确认后再导入');
    error.status = 422;
    throw error;
  }
  const sharedStringsXml = await readEntry('xl/sharedStrings.xml', 10 * 1024 * 1024);
  const sharedStrings = [...sharedStringsXml.matchAll(/<(?:[\w.-]+:)?si\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?si>/gi)]
    .map((match) => xmlText(match[1]));
  const rowMatches = [...worksheetXml.matchAll(/<(?:[\w.-]+:)?row\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?row>/gi)];
  if (rowMatches.length < 2 || rowMatches.length > 10001) {
    const error = new Error('工作表没有数据行或超过 10,000 行限制');
    error.status = 422;
    throw error;
  }
  const readCells = (rowXml) => {
    const cells = new Map();
    const cellMatches = [...rowXml.matchAll(/<(?:[\w.-]+:)?c\b([^>]*)>([\s\S]*?)<\/(?:[\w.-]+:)?c>|<(?:[\w.-]+:)?c\b([^>]*)\/>/gi)];
    for (const match of cellMatches) {
      const attributes = match[1] || match[3] || '';
      const body = match[2] || '';
      const index = columnIndexFromReference(xmlAttribute(attributes, 'r'));
      if (index === null) continue;
      const type = xmlAttribute(attributes, 't');
      const raw = body.match(/<(?:[\w.-]+:)?v\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?v>/i)?.[1];
      const inline = xmlText(body);
      const value = type === 's' ? sharedStrings[Number(raw)] : type === 'inlineStr' ? inline : raw === undefined ? null : decodeXml(raw);
      cells.set(index, value === '' ? null : value);
    }
    return cells;
  };
  const parsedRows = rowMatches.map((match) => ({ number: Number(xmlAttribute(match[0], 'r')) || 0, cells: readCells(match[1]) }));
  const headerEntry = parsedRows.find((entry) => [...entry.cells.values()].filter((value) => Object.hasOwn(fieldAliases, canonicalHeader(value))).length >= 2);
  if (!headerEntry) {
    const error = new Error('未识别到字段表头；请在同一行提供至少两个已支持字段名');
    error.status = 422;
    throw error;
  }
  const headerCells = headerEntry.cells;
  const headers = [...headerCells.entries()].sort(([a], [b]) => a - b).map(([, value]) => String(value ?? '').trim());
  if (!headers.length || headers.some((header) => !header) || headers.length > 40 || new Set(headers.map((header) => header.toLowerCase())).size !== headers.length) {
    const error = new Error('XLSX 表头为空、重复或超过 40 列限制');
    error.status = 422;
    throw error;
  }
  const headerIndexes = [...headerCells.keys()].sort((a, b) => a - b);
  const rows = parsedRows.filter((entry) => entry.number > headerEntry.number).map((entry) => {
    const cells = entry.cells;
    return Object.fromEntries(headers.map((header, index) => {
      const value = cells.get(headerIndexes[index]) ?? null;
      const numeric = typeof value === 'string' && /^\d{1,5}(?:\.\d+)?$/.test(value) ? Number(value) : null;
      const isDateColumn = ['periodStart', 'statisticsStart', 'statisticsEnd'].includes(canonicalHeader(header));
      const normalized = isDateColumn && numeric !== null && numeric > 0 && numeric < 60000
        ? new Date(Date.UTC(1899, 11, 30) + numeric * 86_400_000).toISOString().slice(0, 10)
        : value;
      return [header, normalized];
    }));
  }).filter((row) => Object.values(row).some((value) => value !== null));
  if (!rows.length || rows.some((row) => Object.values(row).some(formulaLike))) {
    const error = new Error(rows.length ? '检测到公式注入风险前缀' : '文件没有数据行');
    error.status = 422;
    throw error;
  }
  return { sourceType: 'xlsx', headers, rows, warnings: [`已选择无公式数据页「${selectedSheet.name}」；其他含公式页未读取。`, 'XLSX 由本机服务解析；隐藏工作表、隐藏行列和当前导入页的公式单元格会被拒绝。'] };
};

const parseLocalXlsx = async ({ filename, mimeType, contentBase64 }) => {
  const normalizedFilename = basename(requiredText(filename, '文件名'));
  if (!normalizedFilename.toLowerCase().endsWith('.xlsx')) {
    const error = new Error('仅支持 XLSX 文件');
    error.status = 400;
    throw error;
  }
  const allowedMime = new Set(['', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream', 'application/zip']);
  if (!allowedMime.has(mimeType || '')) {
    const error = new Error('文件 MIME 类型与 XLSX 不匹配');
    error.status = 400;
    throw error;
  }
  if (typeof contentBase64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(contentBase64)) {
    const error = new Error('XLSX 文件编码无效');
    error.status = 400;
    throw error;
  }
  const buffer = Buffer.from(contentBase64, 'base64');
  if (!buffer.length) {
    const error = new Error('文件为空');
    error.status = 400;
    throw error;
  }
  if (buffer.length > maxImportBytes) {
    const error = new Error('文件超过 50MB 限制');
    error.status = 413;
    throw error;
  }
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    return parsePrefixedXlsx(buffer);
  }
  if (!workbook.worksheets.length) {
    const error = new Error('XLSX 不包含工作表');
    error.status = 422;
    throw error;
  }
  const hiddenSheet = workbook.worksheets.find((sheet) => sheet.state !== 'visible');
  if (hiddenSheet) {
    const error = new Error(`检测到隐藏工作表「${hiddenSheet.name}」；请取消隐藏并人工确认后再导入`);
    error.status = 422;
    throw error;
  }
  const orderedSheets = [...workbook.worksheets].sort((left, right) => importSheetPriority(left.name) - importSheetPriority(right.name));
  const sheetHasFormula = (candidate) => Array.from({ length: candidate.rowCount }, (_, index) => candidate.getRow(index + 1))
    .some((row) => row.values.some((value) => value && typeof value === 'object' && ('formula' in value || 'sharedFormula' in value)));
  const sheet = orderedSheets.find((candidate) => !sheetHasFormula(candidate));
  if (!sheet) {
    const error = new Error('未找到无公式的可导入工作表；请将需要导入的数据复制到无公式页签');
    error.status = 422;
    throw error;
  }
  if (sheet.rowCount < 2 || sheet.columnCount < 1) {
    const error = new Error('工作表没有数据行');
    error.status = 422;
    throw error;
  }
  if (sheet.columns.some((column) => column.hidden) || Array.from({ length: sheet.rowCount }, (_, index) => sheet.getRow(index + 1)).some((row) => row.hidden)) {
    const error = new Error('检测到隐藏行或列；请取消隐藏并人工确认后再导入');
    error.status = 422;
    throw error;
  }
  const headerRow = Array.from({ length: sheet.rowCount }, (_, index) => sheet.getRow(index + 1))
    .find((candidate) => candidate.values.filter((value) => Object.hasOwn(fieldAliases, canonicalHeader(value))).length >= 2);
  if (!headerRow) {
    const error = new Error('未识别到字段表头；请在同一行提供至少两个已支持字段名');
    error.status = 422;
    throw error;
  }
  const headers = Array.from({ length: sheet.columnCount }, (_, index) => headerRow.getCell(index + 1).text.trim());
  if (!headers.length || headers.some((header) => !header)) {
    const error = new Error('存在空白表头');
    error.status = 422;
    throw error;
  }
  if (headers.length > 40 || new Set(headers.map((header) => header.toLowerCase())).size !== headers.length) {
    const error = new Error('存在重复列名或列数超过 40 列限制');
    error.status = 422;
    throw error;
  }
  const rows = [];
  for (let rowNumber = headerRow.number + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const values = headers.map((header, index) => {
      const cell = sheet.getRow(rowNumber).getCell(index + 1);
      const value = cell.value;
      if (value && typeof value === 'object' && ('formula' in value || 'sharedFormula' in value)) {
        const error = new Error(`第 ${rowNumber} 行「${header}」包含公式；本地导入拒绝公式工作簿`);
        error.status = 422;
        throw error;
      }
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      if (value === null || value === undefined || value === '') return null;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
      return cell.text || String(value);
    });
    if (values.every((value) => value === null)) continue;
    rows.push(Object.fromEntries(headers.map((header, index) => [header, values[index]])));
  }
  if (!rows.length || rows.length > 10000) {
    const error = new Error(rows.length ? '数据行超过 10,000 行限制' : '文件没有数据行');
    error.status = 422;
    throw error;
  }
  if (rows.some((row) => Object.values(row).some(formulaLike))) {
    const error = new Error('检测到公式注入风险前缀');
    error.status = 422;
    throw error;
  }
  return { sourceType: 'xlsx', headers, rows, warnings: [`已选择无公式数据页「${sheet.name}」；其他含公式页未读取。`, 'XLSX 由本机服务解析；隐藏工作表、隐藏行列和当前导入页的公式单元格会被拒绝。'] };
};

const validateImport = async (dataType, inputRows) => {
  const allowed = typeFields[dataType];
  if (!allowed) return { rows: [], errors: [{ row: 0, field: 'dataType', message: '不支持的导入类型' }], warnings: [] };
  if (!Array.isArray(inputRows) || inputRows.length === 0) return { rows: [], errors: [{ row: 0, field: 'file', message: '文件没有可导入的数据行' }], warnings: [] };
  if (inputRows.length > 10000) return { rows: [], errors: [{ row: 0, field: 'file', message: '数据行超过 10,000 行限制' }], warnings: [] };
  const rows = canonicalizeRows(inputRows);
  const errors = [];
  const warnings = [];
  const seenCodes = new Set();
  const seenGoals = new Set();

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    for (const key of Object.keys(row)) {
      if (!allowed.includes(key)) errors.push({ row: rowNumber, field: key, message: '非法或未映射列' });
    }
    for (const [key, value] of Object.entries(row)) {
      if (formulaLike(value)) errors.push({ row: rowNumber, field: key, message: '检测到公式注入风险前缀' });
    }

    if (dataType === 'monthly-goals') {
      const name = nullableText(row.name);
      const category = categoryAliases.get(String(row.category || '').trim());
      const periodStart = nullableDate(row.periodStart);
      const targetValue = nullableNumber(row.targetValue);
      if (!name) errors.push({ row: rowNumber, field: 'name', message: '目标名称不能为空' });
      if (!category) errors.push({ row: rowNumber, field: 'category', message: '目标分类无法识别' });
      if (!periodStart) errors.push({ row: rowNumber, field: 'periodStart', message: '日期格式无效' });
      if (Number.isNaN(targetValue)) errors.push({ row: rowNumber, field: 'targetValue', message: '目标值必须为数字或空值' });
      const key = `${name}|${periodStart?.toISOString()}`;
      if (seenGoals.has(key)) errors.push({ row: rowNumber, field: 'name', message: '文件内目标重复' });
      seenGoals.add(key);
      if (name && periodStart && await prisma.goal.findFirst({ where: { name, periodStart } })) {
        errors.push({ row: rowNumber, field: 'name', message: '数据库中已存在同周期目标' });
      }
      Object.assign(row, { name, category, periodStart, targetValue });
    }

    if (dataType === 'asset-metadata') {
      const assetCode = nullableText(row.assetCode)?.toUpperCase();
      const displayName = nullableText(row.displayName);
      const externalMaterialId = nullableText(row.externalMaterialId);
      const durationSeconds = nullableNumber(row.durationSeconds);
      const sourceTypeText = String(row.sourceType || '').trim();
      const sourceType = sourceTypeAliases.get(sourceTypeText) || sourceTypeAliases.get(sourceTypeText.toUpperCase()) || null;
      if (!assetCode || !/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(assetCode)) errors.push({ row: rowNumber, field: 'assetCode', message: '素材编号格式无效' });
      if (!displayName) errors.push({ row: rowNumber, field: 'displayName', message: '素材名称不能为空' });
      if (Number.isNaN(durationSeconds) || (durationSeconds !== null && !Number.isInteger(durationSeconds))) errors.push({ row: rowNumber, field: 'durationSeconds', message: '时长必须为整数或空值' });
      if (!sourceType) errors.push({ row: rowNumber, field: 'sourceType', message: '素材来源无法识别' });
      if (assetCode && (seenCodes.has(assetCode) || await prisma.asset.findUnique({ where: { assetCode } }))) errors.push({ row: rowNumber, field: 'assetCode', message: '素材编号重复' });
      seenCodes.add(assetCode);
      let productId = null;
      if (nullableText(row.productName)) {
        const product = await prisma.product.findFirst({ where: { name: nullableText(row.productName), archivedAt: null } });
        if (!product) errors.push({ row: rowNumber, field: 'productName', message: '无法匹配产品' });
        productId = product?.id || null;
      } else {
        warnings.push({ row: rowNumber, field: 'productName', message: '未提供产品关联' });
      }
      const channelInfo = nullableText(row.channel) ? normalizeChannel(row.channel) : null;
      if (nullableText(row.channel) && !channelInfo) errors.push({ row: rowNumber, field: 'channel', message: '渠道名称无效' });
      Object.assign(row, { assetCode, displayName, externalMaterialId, durationSeconds, sourceType, productId, channelCode: channelInfo?.code || null, channelName: channelInfo?.name || null });
    }

    if (dataType === 'asset-performance') {
      const assetCode = nullableText(row.assetCode)?.toUpperCase();
      const displayName = nullableText(row.displayName);
      const externalMaterialId = nullableText(row.externalMaterialId);
      const accountId = nullableText(row.accountId);
      const campaignId = nullableText(row.campaignId);
      const channelInfo = normalizeChannel(row.channel);
      const channelCode = channelInfo?.code || null;
      const statisticsStart = nullableDate(row.statisticsStart);
      const statisticsEnd = nullableDate(row.statisticsEnd) || statisticsStart;
      const numericFields = ['orderCount', 'transactionAmount', 'spend', 'paidRoi', 'totalRoi', 'gmv', 'cpm', 'cpc', 'cpa', 'impressions', 'plays', 'clicks', 'productClicks', 'addToCart', 'payments', 'ctr', 'cvr'];
      const values = Object.fromEntries(numericFields.map((key) => [key, nullableNumber(row[key])]));
      const asset = assetCode ? await prisma.asset.findUnique({ where: { assetCode } }) : null;
      const channel = channelCode ? await prisma.channel.findUnique({ where: { code: channelCode } }) : null;
      if (!assetCode || !/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(assetCode)) errors.push({ row: rowNumber, field: 'assetCode', message: '素材编号格式无效' });
      if (!asset && !displayName) errors.push({ row: rowNumber, field: 'displayName', message: '素材不存在时，需要提供素材名称以创建素材记录' });
      if (!channelInfo) errors.push({ row: rowNumber, field: 'channel', message: '渠道名称无效' });
      if (!statisticsStart) errors.push({ row: rowNumber, field: 'statisticsStart', message: '日期格式无效' });
      for (const [key, value] of Object.entries(values)) if (Number.isNaN(value)) errors.push({ row: rowNumber, field: key, message: '必须为数字或空值' });
      if (asset && channel && statisticsStart && await prisma.performanceSnapshot.findFirst({ where: { assetId: asset.id, channelId: channel.id, statisticsStart } })) {
        errors.push({ row: rowNumber, field: 'statisticsStart', message: '同素材、渠道与周期的数据已存在' });
      }
      Object.assign(row, { assetId: asset?.id, assetCode, displayName, externalMaterialId, accountId, campaignId, channelCode, channelName: channelInfo?.name || null, channelId: channel?.id, statisticsStart, statisticsEnd, ...values });
    }
  }
  return { rows, errors, warnings };
};

const importRows = async (body) => {
  const filename = basename(requiredText(body.filename, '文件名')).slice(0, 180);
  const dataType = requiredText(body.dataType, '导入类型');
  const validation = await validateImport(dataType, body.rows);
  if (validation.errors.length) return { status: 422, payload: { ok: false, ...validation, rows: validation.rows.slice(0, 20) } };

  const batch = await prisma.importBatch.create({
    data: {
      filename,
      sourceType: body.sourceType === 'xlsx' ? 'xlsx' : 'csv',
      dataType,
      status: 'VALIDATED',
      mappingSnapshot: body.mapping || {},
      validationSummary: { warnings: validation.warnings },
      recordCount: validation.rows.length,
    },
  });
  const created = { goals: [], assets: [], snapshots: [] };

  try {
    await prisma.$transaction(async (tx) => {
      const createdAssetIdsByCode = new Map();
      const ensuredChannelsByCode = new Map();
      const ensureChannel = async (row) => {
        if (!row.channelCode) return null;
        if (ensuredChannelsByCode.has(row.channelCode)) return ensuredChannelsByCode.get(row.channelCode);
        const channel = await tx.channel.upsert({
          where: { code: row.channelCode },
          update: {},
          create: { code: row.channelCode, name: row.channelName || row.channelCode, description: '用户导入的渠道；请在指标词典中确认该平台口径。' },
        });
        ensuredChannelsByCode.set(row.channelCode, channel);
        return channel;
      };
      for (const row of validation.rows) {
        if (dataType === 'monthly-goals') {
          const goal = await tx.goal.create({
            data: {
              name: row.name,
              category: row.category,
              periodType: 'MONTHLY',
              periodStart: row.periodStart,
              periodEnd: monthEnd(row.periodStart),
              targetValue: row.targetValue,
              currentValue: null,
              progressRate: null,
              gapValue: row.targetValue,
              unit: '待确认',
              status: 'ON_TRACK',
              priority: 'MEDIUM',
              source: `导入批次 ${batch.id}`,
              lastUpdatedAt: new Date(),
            },
          });
          created.goals.push(goal.id);
        }
        if (dataType === 'asset-metadata') {
          const channel = await ensureChannel(row);
          const asset = await tx.asset.create({
            data: {
              assetCode: row.assetCode,
              displayName: row.displayName,
              externalMaterialId: nullableText(row.externalMaterialId),
              durationSeconds: row.durationSeconds,
              sourceType: row.sourceType,
              productId: row.productId,
              status: 'DRAFT',
              tags: ['本地导入'],
              channels: channel ? { create: [{ channel: { connect: { id: channel.id } } }] } : undefined,
              versions: { create: [{ versionNumber: 1, changeSummary: '由素材元数据导入创建', durationSeconds: row.durationSeconds }] },
            },
          });
          created.assets.push(asset.id);
        }
        if (dataType === 'asset-performance') {
          const channel = await ensureChannel(row);
          const channelId = channel?.id || row.channelId;
          let assetId = row.assetId || createdAssetIdsByCode.get(row.assetCode);
          if (!assetId) {
            const asset = await tx.asset.create({
              data: {
                assetCode: row.assetCode,
                displayName: row.displayName,
                externalMaterialId: row.externalMaterialId,
                sourceType: 'IMPORTED',
                status: 'INSUFFICIENT_DATA',
                tags: ['截图整理导入'],
                channels: { create: [{ channel: { connect: { id: channelId } } }] },
                versions: { create: [{ versionNumber: 1, changeSummary: '由截图整理的素材表现导入创建', durationSeconds: null }] },
              },
            });
            assetId = asset.id;
            createdAssetIdsByCode.set(row.assetCode, assetId);
            created.assets.push(asset.id);
          }
          const snapshot = await tx.performanceSnapshot.create({
            data: {
              assetId,
              channelId,
              accountId: row.accountId,
              campaignId: row.campaignId,
              statisticsStart: row.statisticsStart,
              statisticsEnd: row.statisticsEnd,
              orderCount: row.orderCount,
              transactionAmount: row.transactionAmount,
              spend: row.spend,
              paidRoi: row.paidRoi,
              totalRoi: row.totalRoi,
              gmv: row.gmv,
              cpm: row.cpm,
              cpc: row.cpc,
              cpa: row.cpa,
              impressions: row.impressions,
              plays: row.plays,
              clicks: row.clicks,
              productClicks: row.productClicks,
              addToCart: row.addToCart,
              payments: row.payments,
              ctr: row.ctr,
              cvr: row.cvr,
              dataSource: `导入批次 ${batch.id}`,
              metricDefinitionVersion: '待确认',
              importBatchId: batch.id,
              importedAt: new Date(),
            },
          });
          created.snapshots.push(snapshot.id);
        }
      }
      await tx.importBatch.update({
        where: { id: batch.id },
        data: {
          status: 'IMPORTED',
          importedAt: new Date(),
          validationSummary: { warnings: validation.warnings, created },
        },
      });
      await tx.auditLog.create({
        data: {
          action: 'IMPORT',
          entityType: 'ImportBatch',
          entityId: batch.id,
          actor: 'local-user',
          summary: `导入 ${dataType}，${validation.rows.length} 行`,
          metadata: { filename, createdCounts: Object.fromEntries(Object.entries(created).map(([key, ids]) => [key, ids.length])) },
        },
      });
    });
  } catch (error) {
    await prisma.importBatch.update({ where: { id: batch.id }, data: { status: 'FAILED', errorCount: 1, validationSummary: { message: error.message } } });
    throw error;
  }

  return { status: 201, payload: { ok: true, batchId: batch.id, recordCount: validation.rows.length, warnings: validation.warnings, created } };
};

const handle = async (request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  const { pathname } = url;

  if (request.method === 'GET' && pathname === '/api/health') {
    const products = await prisma.product.count({ where: { archivedAt: null } });
    return json(response, 200, { ok: true, mode: 'local', database: 'sqlite', products });
  }

  if (request.method === 'GET' && pathname === '/api/products') {
    const rows = await prisma.product.findMany({ where: { archivedAt: null }, include: { _count: { select: { assets: true, goals: true } } }, orderBy: { updatedAt: 'desc' } });
    return json(response, 200, rows);
  }
  if (request.method === 'POST' && pathname === '/api/products') {
    const body = await readJson(request);
    const product = await prisma.product.create({ data: productPayload(body) });
    await audit('CREATE', 'Product', product.id, '创建产品');
    return json(response, 201, product);
  }
  const productId = routeId(pathname, '/api/products/');
  if (productId && request.method === 'PUT') {
    const body = await readJson(request);
    const product = await prisma.product.update({ where: { id: productId }, data: productPayload(body) });
    await audit('UPDATE', 'Product', product.id, '更新产品');
    return json(response, 200, product);
  }
  if (productId && request.method === 'DELETE') {
    const product = await prisma.product.update({ where: { id: productId }, data: { status: 'ARCHIVED', archivedAt: new Date() } });
    await audit('DELETE', 'Product', product.id, '归档产品');
    return json(response, 200, { ok: true, id: product.id });
  }

  if (request.method === 'GET' && pathname === '/api/channels') {
    return json(response, 200, await prisma.channel.findMany({ orderBy: { name: 'asc' } }));
  }

  if (request.method === 'GET' && pathname === '/api/assets') {
    const rows = await prisma.asset.findMany({
      where: { status: { not: 'RETIRED' } },
      include: {
        product: true,
        channels: { include: { channel: true } },
        versions: { orderBy: { versionNumber: 'asc' } },
        snapshots: { orderBy: { statisticsStart: 'asc' }, take: 120, include: { channel: true } },
        timelines: { orderBy: { createdAt: 'desc' }, take: 1, include: { points: { orderBy: { second: 'asc' } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return json(response, 200, rows);
  }
  if (request.method === 'POST' && pathname === '/api/assets') {
    const body = await readJson(request);
    const data = assetPayload(body);
    const channelCodes = arrayValue(body.channelCodes).map((code) => channelAliases.get(code.toUpperCase()) || code).filter((code) => /^[A-Z0-9_]{2,48}$/.test(code));
    const asset = await prisma.asset.create({
      data: {
        ...data,
        channels: { create: channelCodes.map((code) => ({ channel: { connect: { code } } })) },
        versions: { create: [{ versionNumber: 1, changeSummary: '本地创建初版', durationSeconds: data.durationSeconds }] },
      },
      include: { product: true, channels: { include: { channel: true } }, versions: true },
    });
    await audit('CREATE', 'Asset', asset.id, '创建素材基础记录');
    return json(response, 201, asset);
  }
  const versionAssetId = routeId(pathname, '/api/assets/', '/versions');
  if (versionAssetId && request.method === 'POST') {
    const body = await readJson(request);
    const latest = await prisma.assetVersion.findFirst({ where: { assetId: versionAssetId }, orderBy: { versionNumber: 'desc' } });
    const version = await prisma.assetVersion.create({
      data: {
        assetId: versionAssetId,
        versionNumber: (latest?.versionNumber || 0) + 1,
        parentVersionId: latest?.id || null,
        changeSummary: requiredText(body.changeSummary, '版本修改说明'),
        durationSeconds: nullableNumber(body.durationSeconds) ?? latest?.durationSeconds ?? null,
      },
    });
    await audit('CREATE', 'AssetVersion', version.id, '创建素材新版本', { assetId: versionAssetId });
    return json(response, 201, version);
  }
  const assetId = routeId(pathname, '/api/assets/');
  if (assetId && request.method === 'PUT') {
    const body = await readJson(request);
    const data = assetPayload(body);
    const channelCodes = arrayValue(body.channelCodes).map((code) => channelAliases.get(code.toUpperCase()) || code).filter((code) => /^[A-Z0-9_]{2,48}$/.test(code));
    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        ...data,
        channels: { deleteMany: {}, create: channelCodes.map((code) => ({ channel: { connect: { code } } })) },
      },
      include: { product: true, channels: { include: { channel: true } }, versions: true },
    });
    await audit('UPDATE', 'Asset', asset.id, '更新素材基础记录');
    return json(response, 200, asset);
  }
  if (assetId && request.method === 'DELETE') {
    const asset = await prisma.asset.update({ where: { id: assetId }, data: { status: 'RETIRED' } });
    await audit('DELETE', 'Asset', asset.id, '归档素材');
    return json(response, 200, { ok: true, id: asset.id });
  }

  if (request.method === 'GET' && pathname === '/api/goals') {
    const rows = await prisma.goal.findMany({ include: { product: true, channel: true, progress: { orderBy: { date: 'asc' } } }, orderBy: [{ periodStart: 'desc' }, { priority: 'asc' }] });
    return json(response, 200, rows);
  }
  if (request.method === 'POST' && pathname === '/api/goals') {
    const body = await readJson(request);
    const goal = await prisma.goal.create({ data: goalPayload(body) });
    await audit('CREATE', 'Goal', goal.id, '创建经营目标');
    return json(response, 201, goal);
  }
  const progressGoalId = routeId(pathname, '/api/goals/', '/progress');
  if (progressGoalId && request.method === 'POST') {
    const body = await readJson(request);
    const date = nullableDate(body.date);
    const value = nullableNumber(body.value);
    if (!date || Number.isNaN(value)) {
      const error = new Error('每日进度日期或数值无效');
      error.status = 400;
      throw error;
    }
    const progress = await prisma.goalProgress.upsert({
      where: { goalId_date: { goalId: progressGoalId, date } },
      update: { value, source: nullableText(body.source) || '本地手动录入', notes: nullableText(body.notes) },
      create: { goalId: progressGoalId, date, value, source: nullableText(body.source) || '本地手动录入', notes: nullableText(body.notes) },
    });
    const aggregate = await prisma.goalProgress.aggregate({ where: { goalId: progressGoalId }, _sum: { value: true } });
    const goal = await prisma.goal.findUniqueOrThrow({ where: { id: progressGoalId } });
    const currentValue = aggregate._sum.value;
    await prisma.goal.update({
      where: { id: progressGoalId },
      data: {
        currentValue,
        progressRate: goal.targetValue && currentValue !== null ? currentValue / goal.targetValue : null,
        gapValue: goal.targetValue !== null && currentValue !== null ? goal.targetValue - currentValue : null,
        lastUpdatedAt: new Date(),
      },
    });
    await audit('UPDATE', 'GoalProgress', progress.id, '录入每日目标进度', { goalId: progressGoalId });
    return json(response, 201, progress);
  }
  const goalId = routeId(pathname, '/api/goals/');
  if (goalId && request.method === 'PUT') {
    const body = await readJson(request);
    const goal = await prisma.goal.update({ where: { id: goalId }, data: goalPayload(body) });
    await audit('UPDATE', 'Goal', goal.id, '更新经营目标');
    return json(response, 200, goal);
  }
  if (goalId && request.method === 'DELETE') {
    const goal = await prisma.goal.update({ where: { id: goalId }, data: { status: 'PAUSED' } });
    await audit('DELETE', 'Goal', goal.id, '暂停经营目标');
    return json(response, 200, { ok: true, id: goal.id });
  }

  if (request.method === 'POST' && pathname === '/api/imports/validate') {
    const body = await readJson(request);
    const validation = await validateImport(body.dataType, body.rows);
    return json(response, validation.errors.length ? 422 : 200, { ok: validation.errors.length === 0, ...validation, rows: validation.rows.slice(0, 20) });
  }
  if (request.method === 'POST' && pathname === '/api/imports/parse-xlsx') {
    const body = await readJson(request);
    return json(response, 200, await parseLocalXlsx(body));
  }
  if (request.method === 'POST' && pathname === '/api/imports') {
    const body = await readJson(request);
    const result = await importRows(body);
    return json(response, result.status, result.payload);
  }
  if (request.method === 'GET' && pathname === '/api/imports') {
    const rows = await prisma.importBatch.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    return json(response, 200, rows);
  }
  const undoBatchId = routeId(pathname, '/api/imports/', '/undo');
  if (undoBatchId && request.method === 'POST') {
    const batch = await prisma.importBatch.findUniqueOrThrow({ where: { id: undoBatchId } });
    if (batch.status !== 'IMPORTED') return json(response, 409, { ok: false, message: '仅已导入批次可以撤销' });
    const created = batch.validationSummary?.created || {};
    await prisma.$transaction(async (tx) => {
      if (created.snapshots?.length) await tx.performanceSnapshot.deleteMany({ where: { id: { in: created.snapshots } } });
      if (created.goals?.length) await tx.goal.deleteMany({ where: { id: { in: created.goals } } });
      if (created.assets?.length) await tx.asset.deleteMany({ where: { id: { in: created.assets } } });
      await tx.importBatch.update({ where: { id: undoBatchId }, data: { status: 'UNDONE', undoneAt: new Date() } });
      await tx.auditLog.create({ data: { action: 'UNDO_IMPORT', entityType: 'ImportBatch', entityId: undoBatchId, actor: 'local-user', summary: '撤销导入批次' } });
    });
    return json(response, 200, { ok: true });
  }

  return json(response, 404, { ok: false, message: '接口不存在' });
};

const server = createServer(async (request, response) => {
  const startedAt = Date.now();
  try {
    await handle(request, response);
  } catch (error) {
    const status = error.status || (error.code === 'P2025' ? 404 : error.code === 'P2002' ? 409 : 500);
    const publicMessage = status >= 500 ? '本地服务处理失败，请检查日志摘要' : error.message;
    console.error(JSON.stringify({ level: 'error', method: request.method, path: request.url?.split('?')[0], status, message: error.message, durationMs: Date.now() - startedAt }));
    if (!response.headersSent) json(response, status, { ok: false, message: publicMessage });
  }
});

server.listen(port, host, () => {
  console.log(JSON.stringify({ service: 'clipcommerce-local-api', url: `http://${host}:${port}`, database: process.env.DATABASE_URL }));
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
