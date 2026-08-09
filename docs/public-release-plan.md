# Public release record / 公开发布记录

## Product identity / 产品定位

**ClipCommerce Studio** is a local-first analysis workspace for video-commerce data. It is not a brand-specific operating console, a hosted SaaS product, an advertising-account connector, or a replacement for platform attribution and financial settlement.

**ClipCommerce Studio** 是面向视频电商数据的本地优先分析工作台，不是某个品牌专属后台、SaaS 托管服务、广告账户连接器，也不替代平台归因或财务结算。

The accompanying Codex plugin is named `clipcommerce-analyst`. It guides evidence-based analysis; it does not access a user’s accounts or make operating decisions for them.

随附的 Codex 插件名为 `clipcommerce-analyst`，用于组织基于证据的分析；它不会访问用户账户，也不会代替用户做经营决策。

## Release-readiness checklist / 发布检查清单

- [x] Product UI and import model generalized beyond one brand or platform.
- [x] Bilingual README, usage guides, setup guidance, metric interpretation, and troubleshooting added.
- [x] Contribution, support, code-of-conduct, security, issue/PR templates, CI, and Dependabot configuration added.
- [x] Git ignores local databases, exports, media, uploads, reports, environment files, and common secret-bearing material.
- [x] Current workspace history and tracked files inspected for local runtime data; no tracked `.env`, database, spreadsheet, media, or real export files found.
- [x] `typecheck`, `lint`, `test`, `build`, Prisma schema validation, and a custom-platform dry-run import verified locally.
- [x] Production audit high-risk `brace-expansion` transitive chain remediated by a lockfile-only compatible update.
- [ ] Maintainer selects an open-source license. Until then, public code remains all-rights-reserved.
- [ ] Create the public GitHub repository, enable private Security Advisories and Discussions, push `main`, then create the `v0.1.0` release.

## Data boundary / 数据边界

Only synthetic sample data and templates may enter the public repository. Never commit real exports, customer or order data, source video, screenshots, watermarks, account identifiers, API keys, tokens, local databases, logs, environment files, or internal reports.

公开仓库只能包含合成样例和模板。不得提交真实导出表、客户或订单数据、源视频、截图、水印、账户标识、API 密钥、令牌、本地数据库、日志、环境变量文件或内部报告。

## Measurement integrity / 指标口径完整性

The app supports video exposure/attention, traffic, commerce, and efficiency fields because platforms expose distinct stages. TikTok Shop documents spend, impressions, clicks, Shop ROAS, cart, purchase, real-time purchase, video-view depth, and average watch-time fields; it also distinguishes attributed and real-time reporting timing. Google/YouTube document separate impression, engagement, view, click, and conversion paths. The product therefore preserves platform, account, campaign, period, source, and attribution context instead of collapsing all events into one universal conversion metric.

应用同时支持视频曝光/注意力、流量、电商和效率字段，因为平台会分别定义这些阶段。TikTok Shop 官方列出消耗、展示、点击、Shop ROAS、加购、购买、实时购买、视频观看分层和平均观看时长，并区分归因与实时的报表计时；Google/YouTube 也会区分展示、互动、观看、点击和转化路径。因此产品保留平台、账户、计划、周期、来源与归因上下文，避免将所有事件压成一个“通用转化”指标。

Sources: [TikTok Shop Ads reporting](https://ads.tiktok.com/help/article/view-shop-ads-reporting?lang=en), [TikTok Shop reporting time](https://ads.tiktok.com/help/article/about-tiktok-shop-ads-reporting-time?lang=en), [YouTube Analytics metrics](https://support.google.com/youtube/answer/9002587?hl=en), and [Google Ads video conversion measurement](https://support.google.com/google-ads/answer/12262960).

## Dependency note / 依赖说明

On 2026-08-09, `npm audit --omit=dev` reports two moderate advisories through `exceljs` → `uuid`. The only automated remediation requires a breaking downgrade of `exceljs`, so it was intentionally not applied. The risk and mitigations are described in [SECURITY.md](../SECURITY.md). This must be reassessed before each release.

截至 2026-08-09，`npm audit --omit=dev` 仍报告两项由 `exceljs` → `uuid` 引入的中风险告警。唯一自动修复会破坏性降级 `exceljs`，因此没有执行。风险与缓解措施见 [SECURITY.md](../SECURITY.md)，并且每次发布前都必须重新评估。

## Why these repository files exist / 为什么补充这些仓库文件

The public structure follows widely adopted GitHub community-health practice: a clear README, license, code of conduct, contribution guide, security policy, support route, and issue/PR templates make use and maintenance expectations explicit. GitHub documents these files as the components of a healthy community profile; n8n’s public contribution guide is an example of an explicit local-development and change-review workflow. See [GitHub’s community-profile guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories), [GitHub’s default community files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file), and [n8n’s contributing guide](https://github.com/n8n-io/n8n/blob/master/CONTRIBUTING.md).

公开结构参考了 GitHub 社区健康实践：清晰的 README、许可证、行为准则、贡献指南、安全政策、支持路径和 Issue/PR 模板，让使用与维护的预期可被公开审查。GitHub 将这些文件列为健康社区资料；n8n 的公开贡献指南则展示了明确的本地开发和变更审查流程。
