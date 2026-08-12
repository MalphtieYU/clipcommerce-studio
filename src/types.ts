export type Channel = {
  id: string
  code: string
  name: string
}

export type Product = {
  id: string
  name: string
  model: string | null
  series: string | null
  brand: string | null
  status: 'ACTIVE' | 'PENDING_CONFIRMATION' | 'ARCHIVED'
  confirmedClaims: string[]
  pendingClaims: string[]
  prohibitedClaims: string[]
  colors: string[]
  sourceNote: string | null
  verifiedAt: string | null
  verifiedBy: string | null
  updatedAt: string
  _count?: { assets: number; goals: number }
}

export type AssetVersion = {
  id: string
  versionNumber: number
  parentVersionId: string | null
  changeSummary: string | null
  durationSeconds: number | null
  createdAt: string
}

export type Snapshot = {
  id: string
  statisticsStart: string
  statisticsEnd: string
  spend: number | null
  orderCount?: number | null
  transactionAmount?: number | null
  paidRoi: number | null
  totalRoi?: number | null
  gmv: number | null
  cpm?: number | null
  cpc?: number | null
  cpa?: number | null
  ctr: number | null
  cvr: number | null
  impressions: number | null
  plays: number | null
  clicks: number | null
  productClicks: number | null
  addToCart: number | null
  payments: number | null
  dataSource: string | null
  metricDefinitionVersion: string | null
  channel: Channel
}

export type Timeline = {
  id: string
  metricType: string
  dataSource: string | null
  points: { second: number; value: number | null; isPeak: boolean; isDrop: boolean }[]
}

export type StrategyMeta = {
  contentDirection?: string | null
  coreSellingPoint?: string | null
  hook?: string | null
  creator?: string | null
  creatorFreshness?: 'NEW' | 'REUSED' | 'UNKNOWN' | null
  carrier?: string | null
  deliveryGoal?: string | null
  scenario?: string | null
  scriptFamily?: string | null
}

export type Asset = {
  id: string
  assetCode: string
  displayName: string
  externalMaterialId: string | null
  originalFilename: string | null
  localFileReference: string | null
  durationSeconds: number | null
  sourceType: string
  contentType: string | null
  strategyMeta: StrategyMeta | null
  status: string
  tags: string[]
  productId: string | null
  product: Product | null
  channels: { channel: Channel }[]
  versions: AssetVersion[]
  snapshots: Snapshot[]
  timelines: Timeline[]
  updatedAt: string
}

export type GoalProgress = {
  id: string
  date: string
  value: number | null
  source: string | null
}

export type Goal = {
  id: string
  name: string
  category: string
  periodType: string
  periodStart: string
  periodEnd: string
  targetValue: number | null
  currentValue: number | null
  progressRate: number | null
  gapValue: number | null
  unit: string
  priority: string
  status: string
  source: string | null
  productId: string | null
  channelId: string | null
  progress: GoalProgress[]
}

export type ImportBatch = {
  id: string
  filename: string
  dataType: string
  sourceType: string
  status: string
  recordCount: number
  errorCount: number
  importedAt: string | null
  createdAt: string
}

export type ImportIssue = {
  row: number
  field: string
  message: string
}

export type ContextFeedback = {
  id: string
  workContextId: string
  agentName: string | null
  category: string
  summary: string
  evidence: string[]
  recommendations: string[]
  confidence: string | null
  needsHumanApproval: boolean
  createdAt: string
}

export type WorkContext = {
  id: string
  name: string
  department: string | null
  objective: string
  currentTasks: string[]
  informationSources: string[]
  successSignals: string[]
  constraints: string[]
  agentBoundary: string | null
  status: 'ACTIVE' | 'PENDING_CONFIRMATION' | 'ARCHIVED'
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  feedback: ContextFeedback[]
}
