# ClipCommerce Studio

**A local data and review workspace, paired with an optional non-disruptive skill that helps existing agents organize evidence and improve work without replacing current projects or workflows.**

[简体中文](README.zh-CN.md) · [Workspace-agent loop](docs/agent-collaboration-loop.md) · [中文协作闭环](docs/agent-collaboration-loop.zh-CN.md) · [Skill adoption](docs/skill-first-adoption.md) · [User guide](docs/USAGE.md) · [使用指南](docs/使用指南.md) · [Team-agent contexts](docs/team-agent-context.md) · [Douyin creative workflow](docs/douyin-creative-operations.md) · [Metric dictionary](docs/metric-dictionary.md) · [Use boundaries](LEGAL_NOTICE.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

ClipCommerce Studio combines two optional layers: a local workspace keeps a team's existing imports, creative records, review notes, and data definitions together; an opt-in plugin helps an existing agent turn those already-authorized records into clear evidence, gaps, and human-approved suggestions. It does **not** replace the agent, alter existing projects, collect information in the background, or run external actions.

> This is a public, local-first project. Its plugin and workspace remain optional; review the use boundaries before sharing any data with an agent or third party.

## Workspace + agent, without disruption

Use the workspace only where it adds value: it can receive local imports and records that a team already maintains. When an agent needs that information, open **Team Work Context** and explicitly generate a collaboration packet. The packet excludes environment variables, local file paths, account identifiers, customer-level data, and demo snapshots; it includes data-readiness gaps so an agent does not guess.

Install or point your agent to `plugins/clipcommerce-analyst`, then use `$adaptive-work-improvement` with the packet and the current task. Start in Observe mode. The skill does not require a dashboard, an upload, or a rewritten workflow unless that is genuinely needed and explicitly approved.

Read the [workspace-agent collaboration loop](docs/agent-collaboration-loop.md) for the data handoff, and the [skill adoption guide](docs/skill-first-adoption.md) for the safe starter prompt and installation path.

## Optional companion capabilities

- Imports CSV and XLSX files locally, with field mapping, preview, validation, confirmation, and batch rollback.
- Analyzes creative-level video and commerce metrics: impressions, views, clicks, product clicks, carts, payments, orders, GMV/revenue, spend, CTR, CVR, CPM, CPC, CPA, ROI/ROAS.
- Keeps platform, account, campaign, period, attribution, and source context so unlike metrics are not silently compared.
- Prioritizes Douyin / Ocean Engine creative review: content direction, one core selling point, hook, creator freshness, scenario, delivery goal, and script-family reuse are user-entered labels that can be reviewed against imported results.
- Still accepts self-exported data from other platforms through the generic CSV/XLSX field model; it does not claim identical definitions across platforms.
- Lets each department create a minimal local work context for its own agents, then retain evidence-led feedback as human-approved suggestions rather than automated changes.
- Explains metrics in the interface and provides trends and review prompts only when you have imported data—no invented dashboard results.
- Includes the `clipcommerce-analyst` Codex plugin to structure analysis of your own exported data.

## Optional local workspace

Requirements: Node.js 22+ and npm.

```powershell
git clone <YOUR-REPOSITORY-URL>
cd clipcommerce-studio
npm.cmd install
npm.cmd run db:setup
npm.cmd run dev
```

Open the local address printed in the terminal (normally `http://127.0.0.1:5173`). To run the checks used by CI:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

For importing a file, metric definitions, mapping advice, troubleshooting, and the optional local workspace, read the [full user guide](docs/USAGE.md).

## Data and privacy boundaries

- Import only data you are authorized to use. Do not commit exports, customer data, source media, screenshots, account identifiers, or secrets.
- The application is local-first. Imported file bodies are parsed by the local service and are not sent to a third party by this project.
- Different platforms use different view thresholds, attribution windows, and revenue definitions. Compare only rows with a compatible platform, reporting period, delivery scope, and attribution definition.
- ROI/ROAS is not profit. Include refunds, fees, discounts, and fulfilment costs separately when you need profitability.

See [privacy and security details](docs/privacy-and-security.md), [use boundaries and disclaimer](LEGAL_NOTICE.md), and [responsible disclosure](SECURITY.md).

## Platform measurement notes

The field model deliberately keeps both video and commerce funnel data. TikTok Shop reporting can distinguish attributed and real-time purchase timing, while Google video reporting distinguishes impression, engagement, view, click, and conversion paths. Preserve the exported source, date range, and attribution field instead of treating them as identical metrics. See [platform metric sources](docs/platform-metric-sources.md).

## Project status and roadmap

This is a self-hosted local analytics workspace, not a hosted service. Public-release tasks, known dependency posture, and data-cleanliness checks are tracked in [the release plan](docs/public-release-plan.md).

## Community

- Questions and setup help: [SUPPORT.md](SUPPORT.md)
- Bugs and feature ideas: use the GitHub issue templates after the repository is published.
- Contributions: [CONTRIBUTING.md](CONTRIBUTING.md)
- Expected conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security vulnerabilities: [SECURITY.md](SECURITY.md)

## License and boundaries

Licensed under [Apache-2.0](LICENSE). It permits use, modification, and redistribution under its terms, including its “AS IS” warranty disclaimer and liability limitation. The project does not provide a hosted service, support commitment, platform affiliation, outcome guarantee, or professional advice. Read the full [use boundaries and disclaimer](LEGAL_NOTICE.md) before relying on it.
