-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "series" TEXT,
    "brand" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "confirmedClaims" JSONB,
    "pendingClaims" JSONB,
    "prohibitedClaims" JSONB,
    "sourceNote" TEXT,
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MetricDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameEn" TEXT,
    "channelId" TEXT,
    "category" TEXT,
    "rawField" TEXT,
    "formula" TEXT,
    "numerator" TEXT,
    "denominator" TEXT,
    "timeWindow" TEXT,
    "trafficScope" TEXT,
    "refundIncluded" BOOLEAN,
    "taxIncluded" BOOLEAN,
    "source" TEXT,
    "definitionNote" TEXT,
    "version" TEXT NOT NULL DEFAULT 'v1',
    "status" TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "confirmedAt" DATETIME,
    "owner" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MetricDefinition_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "channelId" TEXT,
    "productId" TEXT,
    "periodType" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "baselineValue" REAL,
    "targetValue" REAL,
    "currentValue" REAL,
    "progressRate" REAL,
    "gapValue" REAL,
    "unit" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'ON_TRACK',
    "owner" TEXT,
    "metricDefinitionId" TEXT,
    "source" TEXT,
    "lastUpdatedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Goal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Goal_metricDefinitionId_fkey" FOREIGN KEY ("metricDefinitionId") REFERENCES "MetricDefinition" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoalProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "value" REAL,
    "cumulativeValue" REAL,
    "source" TEXT,
    "importBatchId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoalProgress_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GoalProgress_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalMaterialId" TEXT,
    "assetCode" TEXT NOT NULL,
    "originalFilename" TEXT,
    "displayName" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "durationSeconds" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceType" TEXT NOT NULL,
    "creatorId" TEXT,
    "productId" TEXT,
    "contentType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "firstLaunchStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "incrementalStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "tags" JSONB,
    "analysisStatus" TEXT NOT NULL DEFAULT 'INSUFFICIENT',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Asset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetChannel" (
    "assetId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    PRIMARY KEY ("assetId", "channelId"),
    CONSTRAINT "AssetChannel_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssetChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "parentVersionId" TEXT,
    "changeSummary" TEXT,
    "changedSegments" JSONB,
    "hookType" TEXT,
    "hookText" TEXT,
    "productFirstAppearSecond" INTEGER,
    "ctaAppearSecond" INTEGER,
    "durationSeconds" INTEGER,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssetVersion_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssetVersion_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "AssetVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "assetVersionId" TEXT,
    "channelId" TEXT NOT NULL,
    "accountId" TEXT,
    "campaignId" TEXT,
    "statisticsStart" DATETIME NOT NULL,
    "statisticsEnd" DATETIME NOT NULL,
    "orderCount" INTEGER,
    "transactionAmount" REAL,
    "transactionAmountShare" REAL,
    "spend" REAL,
    "spendShare" REAL,
    "baseSpend" REAL,
    "paidRoi" REAL,
    "totalRoi" REAL,
    "gmv" REAL,
    "ctr" REAL,
    "cvr" REAL,
    "cpm" REAL,
    "cpc" REAL,
    "cpa" REAL,
    "impressions" INTEGER,
    "plays" INTEGER,
    "clicks" INTEGER,
    "productClicks" INTEGER,
    "addToCart" INTEGER,
    "payments" INTEGER,
    "dataSource" TEXT,
    "metricDefinitionVersion" TEXT,
    "metricDefinitionId" TEXT,
    "importedAt" DATETIME,
    "importBatchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceSnapshot_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceSnapshot_assetVersionId_fkey" FOREIGN KEY ("assetVersionId") REFERENCES "AssetVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PerformanceSnapshot_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PerformanceSnapshot_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PerformanceSnapshot_metricDefinitionId_fkey" FOREIGN KEY ("metricDefinitionId") REFERENCES "MetricDefinition" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InteractionTimeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "assetVersionId" TEXT,
    "channelId" TEXT NOT NULL,
    "statisticsStart" DATETIME NOT NULL,
    "statisticsEnd" DATETIME NOT NULL,
    "durationSeconds" INTEGER,
    "metricType" TEXT NOT NULL,
    "dataSource" TEXT,
    "importBatchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InteractionTimeline_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InteractionTimeline_assetVersionId_fkey" FOREIGN KEY ("assetVersionId") REFERENCES "AssetVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InteractionTimeline_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InteractionTimeline_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InteractionPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timelineId" TEXT NOT NULL,
    "second" INTEGER NOT NULL,
    "timestampLabel" TEXT,
    "value" REAL,
    "normalizedValue" REAL,
    "changeRate" REAL,
    "isPeak" BOOLEAN NOT NULL DEFAULT false,
    "isDrop" BOOLEAN NOT NULL DEFAULT false,
    "contentSegmentId" TEXT,
    "frameReference" TEXT,
    "notes" TEXT,
    CONSTRAINT "InteractionPoint_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "InteractionTimeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InteractionPoint_contentSegmentId_fkey" FOREIGN KEY ("contentSegmentId") REFERENCES "ContentSegment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetVersionId" TEXT NOT NULL,
    "startSecond" INTEGER NOT NULL,
    "endSecond" INTEGER NOT NULL,
    "segmentType" TEXT NOT NULL,
    "description" TEXT,
    "visualContent" TEXT,
    "spokenContent" TEXT,
    "subtitleContent" TEXT,
    "productShown" BOOLEAN,
    "sellingPointId" TEXT,
    "ctaType" TEXT,
    "emotionalTone" TEXT,
    "manuallyConfirmed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ContentSegment_assetVersionId_fkey" FOREIGN KEY ("assetVersionId") REFERENCES "AssetVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "channelCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "mappingSnapshot" JSONB,
    "validationSummary" JSONB,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "importedAt" DATETIME,
    "undoneAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "assetVersionId" TEXT,
    "title" TEXT NOT NULL,
    "evidenceStatus" TEXT NOT NULL DEFAULT 'INSUFFICIENT',
    "dataPeriod" TEXT,
    "sampleDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "evidence" TEXT,
    "relatedSecond" INTEGER,
    "relatedMetric" TEXT,
    "relatedSegmentId" TEXT,
    "confidence" TEXT,
    "confounders" TEXT,
    "needsHumanConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "detail" TEXT,
    "targetSecond" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewAction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeeklyReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sections" JSONB,
    "dataLimitNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "actor" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_code_key" ON "Channel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MetricDefinition_key_channelId_version_key" ON "MetricDefinition"("key", "channelId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "GoalProgress_goalId_date_key" ON "GoalProgress"("goalId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_externalMaterialId_key" ON "Asset"("externalMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetCode_key" ON "Asset"("assetCode");

-- CreateIndex
CREATE UNIQUE INDEX "AssetVersion_assetId_versionNumber_key" ON "AssetVersion"("assetId", "versionNumber");

-- CreateIndex
CREATE INDEX "PerformanceSnapshot_assetId_statisticsStart_statisticsEnd_idx" ON "PerformanceSnapshot"("assetId", "statisticsStart", "statisticsEnd");

-- CreateIndex
CREATE INDEX "InteractionTimeline_assetId_metricType_statisticsStart_statisticsEnd_idx" ON "InteractionTimeline"("assetId", "metricType", "statisticsStart", "statisticsEnd");

-- CreateIndex
CREATE UNIQUE INDEX "InteractionPoint_timelineId_second_key" ON "InteractionPoint"("timelineId", "second");

