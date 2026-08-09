# ClipCommerce Studio 公开发布计划

## 产品定位

ClipCommerce Studio 是本地优先的视频电商分析工具，而不是某个品牌、店铺或平台的运营后台。它接收用户自己导出的表格，提供透明的字段映射、跨平台可比性检查、素材漏斗分析和复盘建议。

建议公开名称：**ClipCommerce Studio**。

- `Clip` 表示视频素材；`Commerce` 表示从内容到成交的完整链路。
- Codex 可安装插件名：`clipcommerce-analyst`。
- 不承诺替代平台原生归因、财务结算或专业的广告投放建议。

## 基于官方平台资料补充的通用需求

| 需求 | 已加入的公开版能力 | 注意事项 |
| --- | --- | --- |
| 视频吸引力与留存 | 导入展示、播放/观看、点击和视频观看质量字段；素材趋势与指标解释 | 不同平台的观看/播放门槛不同，不能混算。 |
| 电商漏斗 | 商品点击、加购、支付、订单、成交金额/GMV 和转化率字段 | 每一层必须来自同一日期、同一维度和同一来源。 |
| 广告效率 | 消耗、CPM、CPC、CPA、支付 ROI、ROAS | ROAS 不是利润；需标明收入和归因窗口。 |
| 投放上下文 | 平台/渠道、广告账户、广告计划、统计起止日期 | 比较前须保持目标、版位、受众和归因规则可比。 |
| 跨平台使用 | 内置抖音、TikTok Shop、天猫、京东、Shopify、Meta Ads、YouTube/Google Ads、Amazon，并允许自定义渠道 | 自定义渠道需要用户在指标词典中补充口径。 |

TikTok Shop 官方报告将消耗、展示、点击、Shop ROAS、加购、购买、实时购买、视频观看分层和平均观看时长列为可用指标，并明确归因转化与实时转化按不同时间记录；因此公开版保留原始字段和统计周期，不自动把二者混为同一成交。 [TikTok Shop Ads reporting](https://ads.tiktok.com/help/article/view-shop-ads-reporting?lang=en) [TikTok Shop reporting time](https://ads.tiktok.com/help/article/about-tiktok-shop-ads-reporting-time?lang=en)

YouTube / Google Ads 的官方资料把展示、观看、互动、点击、转化以及观看时长作为不同漏斗层；视频转化还应区分点击后、互动后和观看后口径。公开版因此新增投放层级和成本字段，并要求在分析中显示口径限制。 [YouTube Analytics](https://support.google.com/youtube/answer/9002587?hl=en) [Google Ads video conversion funnel](https://support.google.com/google-ads/answer/12262960?hl=en)

## 发布前必须完成

1. 选择并确认开源许可证（MIT、Apache-2.0 或其他）；未选择前不应声称为可自由复用的开源项目。
2. 新建干净的公开仓库或彻底审查 Git 历史，确保没有真实数据库、表格、截图、素材、日志、环境变量或公司名称。
3. 为安装、贡献、安全漏洞披露、数据处理边界和平台商标添加公开文档。
4. 在干净目录进行从克隆到安装、导入匿名样例、撤销导入、卸载 Skill 的端到端测试。
5. 处理或在安全公告中明确当前 `npm audit` 报告的 3 项高风险、3 项中风险依赖问题；不使用 `npm audit fix --force` 进行未经验证的破坏性降级。
6. 由项目负责人确认名称、许可证、维护者身份、支持范围和 GitHub 仓库可见性后，才创建远程仓库与发布版本。
