# ClipCommerce Studio

**A local-first workspace for turning video-commerce exports into an explainable performance review.**

[简体中文](README.zh-CN.md) · [User guide](docs/USAGE.md) · [使用指南](docs/使用指南.md) · [Metric dictionary](docs/metric-dictionary.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

ClipCommerce Studio helps creators, e-commerce operators, and growth teams examine the path from video exposure to clicks, orders, revenue, and advertising return. It works from files you export yourself; it does **not** sign in to, scrape, or control any platform account.

> The project is ready for public-release preparation, but it is not yet an open-source release: the maintainer must select a license before the public repository is created.

## What it does

- Imports CSV and XLSX files locally, with field mapping, preview, validation, confirmation, and batch rollback.
- Analyzes creative-level video and commerce metrics: impressions, views, clicks, product clicks, carts, payments, orders, GMV/revenue, spend, CTR, CVR, CPM, CPC, CPA, ROI/ROAS.
- Keeps platform, account, campaign, period, attribution, and source context so unlike metrics are not silently compared.
- Supports Douyin, TikTok Shop, Tmall, JD, Shopify, Meta Ads, YouTube/Google Ads, Amazon, and safely normalized custom platforms.
- Explains metrics in the interface and provides trends and review prompts only when you have imported data—no invented dashboard results.
- Includes the `clipcommerce-analyst` Codex plugin to structure analysis of your own exported data.

## Quick start

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

For importing a file, metric definitions, mapping advice, troubleshooting, and installation of the optional Codex plugin, read the [full user guide](docs/USAGE.md).

## Data and privacy boundaries

- Import only data you are authorized to use. Do not commit exports, customer data, source media, screenshots, account identifiers, or secrets.
- The application is local-first. Imported file bodies are parsed by the local service and are not sent to a third party by this project.
- Different platforms use different view thresholds, attribution windows, and revenue definitions. Compare only rows with a compatible platform, reporting period, delivery scope, and attribution definition.
- ROI/ROAS is not profit. Include refunds, fees, discounts, and fulfilment costs separately when you need profitability.

See [privacy and security details](docs/privacy-and-security.md) and [responsible disclosure](SECURITY.md).

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

## License

No license has been selected yet. Until the maintainer adds one, all rights are reserved. Do not redistribute, repackage, or commercially reuse the repository content.
