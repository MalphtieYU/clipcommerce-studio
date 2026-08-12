# Changelog

All notable changes are documented here. The project follows [Semantic Versioning](https://semver.org/).

## Unreleased — Skill-first, non-disruptive adoption

### Changed / 调整

- Repositioned the public project around the optional `adaptive-work-improvement` skill. The local workspace remains a companion, not a required workflow or data-upload destination.
- Added an explicit non-interference contract: the skill begins read-only, cannot alter existing agents, projects, prompts, tools, schedules, data, or external systems without current-task user authorization.
- Defined user-approved learning as a small feedback loop rather than background collection, cross-user learning, or uncontrolled autonomous updates.

### Added / 新增

- Added a bilingual skill-first adoption guide with a safe copy-and-use prompt for existing agents.
- Added the adaptive skill's working modes, response format, change-proposal contract, and optional local-companion boundary.

## Unreleased — Team-agent adaptation layer

### Added / 新增

- Added local team work contexts with optional tasks, authorized information sources, success signals, constraints, and agent boundaries.
- Added a local agent-brief endpoint and structured feedback records for understanding, strengths, improvements, data gaps, and adaptation ideas.
- Added explicit human-approval defaults: feedback cannot automatically alter workflows, data, budgets, platform settings, or external systems.
- Updated the bundled analyst skill and bilingual documentation so department agents use work context as guidance, preserve flexibility, identify unknowns, and return evidence-led feedback.

## Unreleased — Douyin creative experiment focus

### Added / 新增

- Added the Creative Strategy Lab for user-entered content direction, one core selling point, hook, creator freshness, scenario, delivery goal, and script-family review.
- Added these optional fields to the material form and the asset-metadata CSV/XLSX import mapping, with server-side length and freshness validation.
- Added a local-browser-only private planning note. It is not written to SQLite or the repository.
- Added `strategyMeta` as a nullable Asset field and a forward-only SQLite migration; existing records remain unchanged.
- Added a documented Douyin / Ocean Engine creative experiment workflow, metric boundaries, and public reference links.

### Changed / 调整

- Repositioned the public workspace: Douyin / Ocean Engine creative experimentation is first-class; other platforms remain supported through user-exported generic files.
- Strategy aggregates exclude demo snapshots and state their comparison and causality limits.

## 0.1.0 — 2026-08-09

### Added

- Local-first CSV/XLSX import, validation, preview, confirmation, history, and batch rollback.
- Creative, commerce, and paid-media fields from video attention through revenue and ROAS.
- Support for major video-commerce platforms plus normalized custom platform names.
- Bilingual English/Chinese README and user guides, troubleshooting, contribution, support, security, and community files.
- Continuous-integration and dependency-update workflows.
- `clipcommerce-analyst` Codex plugin for structured evidence-based analysis.

### Security

- Kept local data, exports, media, environment files, databases, and logs out of Git through ignore rules.
- Updated the compatible lockfile dependency chain that addressed the high-severity `brace-expansion` audit advisory.
- Documented the remaining ExcelJS/UUID moderate advisory and its local-only mitigation boundary.

### Added / 新增

- 本地 CSV/XLSX 导入、校验、预览、确认、历史和批次回滚。
- 覆盖视频注意力、交易与广告效率的素材分析字段。
- 内置主要视频电商平台，并支持规范化自定义平台名称。
- 中英文 README、使用指南、排障、贡献、支持、安全和社区文件。
- 持续集成与依赖更新工作流。
- 用于结构化、基于证据分析的 `clipcommerce-analyst` Codex 插件。
