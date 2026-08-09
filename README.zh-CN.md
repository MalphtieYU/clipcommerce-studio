# ClipCommerce Studio

**把视频电商导出数据变成可解释复盘的本地优先工作台。**

[English](README.md) · [使用指南](docs/使用指南.md) · [User guide](docs/USAGE.md) · [指标词典](docs/metric-dictionary.md) · [安全说明](SECURITY.md) · [参与贡献](CONTRIBUTING.zh-CN.md)

ClipCommerce Studio 面向短视频创作者、电商运营和增长团队，帮助你查看素材从曝光、观看、点击，到加购、订单、成交额和投放回报的完整链路。它只分析你主动导出的文件，**不会**登录、抓取或控制任何平台账户。

> 项目已完成公开发布的资料准备，但尚未正式开源：维护者需要先选择许可证，才会创建公开仓库。

## 能做什么

- 在本地导入 CSV/XLSX，完成字段映射、预览、校验、确认写入和整批撤销。
- 从素材维度分析展示、播放/观看、点击、商品点击、加购、支付、订单、GMV/成交额、消耗、CTR、CVR、CPM、CPC、CPA、ROI/ROAS。
- 保留平台、广告账户、计划、统计周期、归因和来源，避免把口径不同的数据悄悄混在一起比较。
- 内置抖音、TikTok Shop、天猫、京东、Shopify、Meta Ads、YouTube/Google Ads、Amazon，并可安全地导入其他自定义平台。
- 只有在你真实导入数据后，才展示趋势与复盘入口；不会用模拟数字伪造分析结论。
- 附带 `clipcommerce-analyst` Codex 插件，用统一的证据、口径和行动建议框架分析你自己的导出数据。

## 快速开始

环境要求：Node.js 22+ 与 npm。

```powershell
git clone <你的仓库地址>
cd clipcommerce-studio
npm.cmd install
npm.cmd run db:setup
npm.cmd run dev
```

在终端中打开显示的本地地址（一般为 `http://127.0.0.1:5173`）。运行与持续集成一致的检查：

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

关于文件导入、字段映射、指标解释、常见问题和可选 Codex 插件安装，请阅读完整的[使用指南](docs/使用指南.md)。

## 数据与隐私边界

- 仅导入你有权使用的数据。不要提交导出表、客户数据、真实素材、截图、广告账户标识或密钥。
- 应用以本地使用为前提：导入文件由本地服务解析，项目不会将文件内容发送给第三方。
- 不同平台的播放阈值、归因窗口和收入定义并不相同。比较前必须确认平台、统计周期、投放范围和归因定义可比。
- ROI/ROAS 不是利润。如需评估利润，还要单独纳入退款、平台费用、折扣、履约等成本。

详见[隐私与安全说明](docs/privacy-and-security.md)和[安全漏洞披露方式](SECURITY.md)。

## 平台口径说明

本项目同时保留视频与电商漏斗字段。TikTok Shop 报表会区分归因购买与实时购买的计时方式；Google 视频报表也会区分展示、互动、观看、点击和转化链路。因此请保留导出来源、日期范围和归因字段，不能将它们视为完全相同的指标。参考[平台指标来源](docs/platform-metric-sources.md)。

## 社区与贡献

- 使用、安装问题：[SUPPORT.md](SUPPORT.md)
- Bug 与功能建议：公开仓库创建后使用 GitHub Issue 模板。
- 贡献代码：[CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md)
- 行为准则：[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 安全漏洞：[SECURITY.md](SECURITY.md)

## 许可证

当前尚未选定许可证。在维护者添加许可证前，仓库内容保留全部权利；请勿再分发、打包发布或用于商业复用。

