# ClipCommerce Studio

> 本地优先的视频电商增长分析工作台。用于把短视频、投放和成交数据放到同一个可复盘流程中，而不是替你访问平台账户或替你做经营决策。

ClipCommerce Studio 面向做短视频、电商投放或内容增长的个人和团队。你可以导入自己从抖音、TikTok Shop、天猫、京东、Shopify、Meta Ads、YouTube / Google Ads、Amazon 或其他平台导出的 CSV/XLSX，检查素材从观看、点击到商品互动、订单和回报的变化。

## 能做什么

- 本地解析、预览、字段映射、校验、确认写入和撤销导入；文件不发送给第三方。
- 素材维度的观看、点击、商品点击、加购、支付、订单、GMV、消耗、CTR、CVR、CPM、CPC、CPA、ROI/ROAS 分析。
- 保留平台、广告账户、广告计划、统计周期和数据来源，避免把不同归因口径硬放在一起比较。
- 提供指标词典、趋势曲线和基于已导入数据的复盘入口；没有数据时不会伪造分析结论。
- 附带 `clipcommerce-analyst` Codex Skill：让 Codex 用同一套证据、口径和行动建议框架分析你的导出表。

## 本地运行

```powershell
npm.cmd install
npm.cmd run db:setup
npm.cmd run dev
```

检查命令：

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## 数据边界

- 仅导入你有权使用的数据；不要提交原始素材、客户信息、广告账户标识、截图、导出表或密钥。
- 平台字段、归因窗口和成交口径并不天然相同。比较前务必统一平台、目标、日期、投放层级与归因定义。
- 工作台不会连接、抓取或代替登录任何平台；它只分析你手动导入的文件。

## 公开发布前

仓库尚未发布。公开发布前仍需完成：选择开源许可证、替换演示数据库、人工检查 Git 历史与公开文档、补充贡献与安全披露说明。详见 [公开发布计划](docs/public-release-plan.md)。
