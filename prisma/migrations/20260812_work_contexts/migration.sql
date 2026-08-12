CREATE TABLE "WorkContext" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "objective" TEXT NOT NULL,
    "currentTasks" JSONB,
    "informationSources" JSONB,
    "successSignals" JSONB,
    "constraints" JSONB,
    "agentBoundary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "ContextFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workContextId" TEXT NOT NULL,
    "agentName" TEXT,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "evidence" JSONB,
    "recommendations" JSONB,
    "confidence" TEXT,
    "needsHumanApproval" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContextFeedback_workContextId_fkey" FOREIGN KEY ("workContextId") REFERENCES "WorkContext" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ContextFeedback_workContextId_createdAt_idx" ON "ContextFeedback"("workContextId", "createdAt");
