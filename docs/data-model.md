# 数据模型

核心实体包括 Product、Channel、MetricDefinition、Goal、GoalProgress、Asset、AssetVersion、PerformanceSnapshot、InteractionTimeline、InteractionPoint、ContentSegment、ImportBatch、Review、ReviewAction、WeeklyReport 与 AuditLog。

完整可执行关系定义位于 `prisma/schema.prisma`。数值字段允许 `null`，以明确区分真实 0、缺少数据、尚未产生与不适用。
