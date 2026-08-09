# Security policy / 安全政策

## Supported version / 支持版本

Security fixes are prepared for the latest `0.x` release on the default branch. Older snapshots are not guaranteed to receive patches.

## Report a vulnerability / 报告漏洞

Do **not** open a public issue for a suspected vulnerability and do not include real customer data, files, tokens, or credentials in a report.

After the repository is published, use GitHub’s private Security Advisory flow in the repository’s **Security** tab. Include a minimal reproducible example with synthetic data, the affected version, impact, and steps to reproduce. Maintainers will acknowledge valid reports, assess impact, and coordinate a fix before disclosure when possible.

公开仓库创建后，请在仓库 **Security** 页使用 GitHub 私有 Security Advisory 提交流程。请勿公开提交漏洞，也不要在报告中携带真实客户数据、文件、令牌或密钥。报告应包含合成数据构造的最小复现、受影响版本、影响与复现步骤。

## Current dependency posture / 当前依赖状态

As of 2026-08-09, production-only `npm audit` reports **two moderate advisories** inherited through `exceljs` → `uuid`. The available automated remediation would downgrade `exceljs` to a breaking version and has not been applied. The application does not pass caller-controlled buffers to UUID APIs, and spreadsheet inputs are parsed locally with type, size, row, formula, and validation controls; this reduces but does not eliminate dependency risk. Keep the project local, do not expose the local API to the public internet, and update or replace the dependency when a compatible upstream fix becomes available.

截至 2026-08-09，生产依赖的 `npm audit` 仍报告两项由 `exceljs` → `uuid` 引入的中风险告警。自动修复会将 `exceljs` 降级为破坏性版本，因此未执行。项目不会把调用者可控缓冲区传入 UUID API；表格仅在本地解析，且有文件类型、大小、行数、公式和字段校验。这能降低但不能消除依赖风险。请保持服务本地运行，勿将本地 API 暴露到公网；上游出现兼容修复后应及时升级或替换依赖。
