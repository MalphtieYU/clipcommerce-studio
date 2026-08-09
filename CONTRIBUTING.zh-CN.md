# 参与贡献

感谢你帮助改进 ClipCommerce Studio。本项目将数据口径视为产品行为：如果改动让指标看起来更简单、却变得不真实，它就不是改进。

## 开始之前

1. 阅读[使用指南](docs/使用指南.md)、[安全政策](SECURITY.md)和[行为准则](CODE_OF_CONDUCT.md)。
2. 大型功能或指标定义变动请先创建 Issue，确认范围和平台术语。
3. 不得提交生产导出表、真实素材、截图、账户 ID、`.env` 文件、数据库、API 密钥或客户信息。
4. 测试和示例必须使用合成或脱敏数据。

## 开发流程

```powershell
npm.cmd install
npm.cmd run db:setup
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

修改应保持聚焦。只要工作流、指标定义或支持的平台发生变化，就同时更新中英文用户文档。涉及平台归因的改动应说明假设、官方来源和可比性限制。

## Pull Request

- 使用清晰且范围明确的标题。
- 说明改了什么、为什么改、如何测试，以及它对用户数据或指标的影响。
- 行为变更要新增或更新测试。
- 不要加入本地生成数据和无关格式化。
- 合并前由维护者审核安全性、数据边界、指标口径和文档。

漏洞请遵循 [SECURITY.md](SECURITY.md) 的私有流程，不要提交公开 Issue 或 PR。
