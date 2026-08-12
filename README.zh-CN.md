# ClipCommerce Studio

**一个本地数据与复盘工作台，搭配可选、非侵入的 Skill：让现有智能体整理证据、提出改进，同时保护原有项目与流程。**

[English](README.md) · [工作台与智能体协作闭环](docs/agent-collaboration-loop.zh-CN.md) · [English loop](docs/agent-collaboration-loop.md) · [Skill 使用方式](docs/skill-first-adoption.zh-CN.md) · [使用指南](docs/使用指南.md) · [User guide](docs/USAGE.md) · [团队智能体上下文](docs/team-agent-context.md) · [抖音创意实验工作流](docs/douyin-creative-operations.md) · [指标词典](docs/metric-dictionary.md) · [使用边界](LEGAL_NOTICE.md) · [安全说明](SECURITY.md) · [参与贡献](CONTRIBUTING.zh-CN.md)

ClipCommerce Studio 由两个可选层组成：本地工作台保存团队既有的导入数据、素材记录、复盘信息和指标口径；可选插件帮助现有智能体把这些已授权信息整理为清晰证据、数据缺口和需人工确认的建议。它**不会**替换智能体、改动既有项目、在后台收集信息或执行外部动作。

> 这是一个公开的、本地优先项目。插件和工作台均为可选能力；向智能体或第三方分享任何数据前，请先阅读使用边界。

## 工作台 + 智能体，且不打扰原有工作

工作台只在它能增加价值时才使用：继续正常导入或记录团队已有的信息。当 agent 确实需要这些信息时，在“团队工作上下文”中主动生成协作数据包。数据包不含环境变量、本地文件路径、账户标识、客户级数据和演示快照，并会明确标出数据缺口，避免智能体猜测。

将智能体指向 `plugins/clipcommerce-analyst`，再将协作数据包和当前任务交给 `$adaptive-work-improvement`，从 Observe（观察）模式开始。除非确有必要且你明确同意，Skill 不会要求你使用工作台、上传数据或重写原有流程。

协作数据交接见 [工作台与智能体协作闭环](docs/agent-collaboration-loop.zh-CN.md)，安全提示词与获取方式见 [Skill 使用方式](docs/skill-first-adoption.zh-CN.md)。

## 可选的本地伴侣能力

- 在本地导入 CSV/XLSX，完成字段映射、预览、校验、确认写入和整批撤销。
- 从素材维度分析展示、播放/观看、点击、商品点击、加购、支付、订单、GMV/成交额、消耗、CTR、CVR、CPM、CPC、CPA、ROI/ROAS。
- 保留平台、广告账户、计划、统计周期、归因和来源，避免把口径不同的数据悄悄混在一起比较。
- 内置抖音、TikTok Shop、天猫、京东、Shopify、Meta Ads、YouTube/Google Ads、Amazon，并可安全地导入其他自定义平台。
- 只有在你真实导入数据后，才展示趋势与复盘入口；不会用模拟数字伪造分析结论。
- 附带 `clipcommerce-analyst` Codex 插件，用统一的证据、口径和行动建议框架分析你自己的导出数据。
- 当前优先支持抖音 / 巨量千川的创意实验复盘：内容方向、单一核心卖点、开头钩子、达人新鲜度、场景、投放目标和脚本族均由用户填写，再与真实导入表现对应查看。
- 仍可通过通用 CSV/XLSX 字段模型导入其他平台的自有导出数据；不同平台口径不会被强行视为相同。
- 各部门可以建立最小化的本地工作上下文，供各自智能体理解目标和约束；智能体的证据化反馈只作为待人工确认建议保存，不会自动改动流程。

## 可选本地工作台

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

关于文件导入、字段映射、指标解释、常见问题和可选本地工作台，请阅读完整的[使用指南](docs/使用指南.md)。

## 数据与隐私边界

- 仅导入你有权使用的数据。不要提交导出表、客户数据、真实素材、截图、广告账户标识或密钥。
- 应用以本地使用为前提：导入文件由本地服务解析，项目不会将文件内容发送给第三方。
- 不同平台的播放阈值、归因窗口和收入定义并不相同。比较前必须确认平台、统计周期、投放范围和归因定义可比。
- ROI/ROAS 不是利润。如需评估利润，还要单独纳入退款、平台费用、折扣、履约等成本。

详见[隐私与安全说明](docs/privacy-and-security.md)、[使用边界与免责声明](LEGAL_NOTICE.md)和[安全漏洞披露方式](SECURITY.md)。

## 平台口径说明

本项目同时保留视频与电商漏斗字段。TikTok Shop 报表会区分归因购买与实时购买的计时方式；Google 视频报表也会区分展示、互动、观看、点击和转化链路。因此请保留导出来源、日期范围和归因字段，不能将它们视为完全相同的指标。参考[平台指标来源](docs/platform-metric-sources.md)。

## 社区与贡献

- 使用、安装问题：[SUPPORT.md](SUPPORT.md)
- Bug 与功能建议：公开仓库创建后使用 GitHub Issue 模板。
- 贡献代码：[CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md)
- 行为准则：[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 安全漏洞：[SECURITY.md](SECURITY.md)

## 许可证与边界

本项目采用 [Apache-2.0](LICENSE)。它允许在许可证条件下使用、修改和再分发，并包含“按现状”提供及责任限制条款。本项目不提供托管服务、支持承诺、平台背书、经营结果保证或专业意见。依赖本项目之前，请阅读完整的[使用边界与免责声明](LEGAL_NOTICE.md)。
