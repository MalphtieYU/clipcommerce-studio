# User guide

## 1. Start the local workspace

Install Node.js 22 or later, then run `npm.cmd install`, `npm.cmd run db:setup`, and `npm.cmd run dev` from the repository root. The development command starts the browser application and its local API. Keep the terminal open while using the app.

If `npm.cmd run db:setup` fails, run `npm.cmd run db:generate` first and read the exact error. Do not delete an existing `data/` directory to “fix” a problem: it may contain your local analysis database.

## 2. Prepare an export

Export a CSV or XLSX from your content, shop, or advertising platform. Use one row for one comparable unit—for example, a creative for one day, campaign, or reporting period. Keep these columns whenever they exist:

| Purpose | Recommended fields |
| --- | --- |
| Identity | asset ID/name, platform/channel, date or date range, source |
| Delivery context | account, campaign/ad group, objective, attribution window |
| Video | impressions, views/plays, watch time, completed views |
| Traffic | clicks, product clicks |
| Commerce | add-to-cart, payments, orders, GMV/revenue, refunds if available |
| Cost | spend, CPM, CPC, CPA, ROI or ROAS |

The project accepts common aliases such as `campaign_name`, `purchases`, `revenue`, and `roas`. For an unfamiliar platform, enter the platform name as a custom channel; the importer creates a safe normalized code.

Do not mix different attribution windows or date ranges in a single comparison. Example: “TikTok Shop attributed purchases, last 7 days” and “real-time orders, same day” may both be valid but they are not the same series.

## 3. Import safely

1. Open **Data Import** and choose the import type closest to your export.
2. Select a CSV or XLSX. The file is checked before any database write.
3. Choose the data sheet when the workbook has several sheets. Formula-containing sheets are intentionally rejected; copy values to a clean sheet first.
4. Review field mapping and preview rows. Fix errors such as a blank asset ID, invalid date, or text in a number column.
5. Confirm the import only after the preview is correct. The import history records the batch.
6. If the data was wrong, use the batch rollback action. It reverses the selected import batch, not unrelated data.

The local server limits file type, size, rows, and unsafe formula prefixes. It does not execute spreadsheet formulas.

## 4. Read the analysis without overclaiming

Start with a single platform, date range, and delivery scope. Then look through the funnel:

1. **Exposure and attention:** impressions, views, watch time, completion.
2. **Interest:** CTR and product-click rate.
3. **Commerce intent:** cart and payment rate.
4. **Outcome and efficiency:** orders, revenue, CPA, and ROAS.

Hover or select a metric help marker in the app for its definition, formula, direction, and interpretation. A high CTR with a low purchase rate is not automatically good: the creative may attract the wrong expectation. A high ROAS is not profit and can be distorted by attribution, refunds, or a small spend base.

Use trends as evidence of a change, not proof of its cause. Check audience, objective, placement, bid strategy, creative version, and the platform’s attribution definition before deciding what to scale.

## 5. Use the optional Codex plugin

The plugin lives in `plugins/clipcommerce-analyst`. It is intended for a Codex environment where you explicitly install or point to this local plugin. Ask Codex to analyze an exported performance file and include the platform, reporting period, attribution window, and business goal. The skill will ask for missing context rather than pretend that a platform metric has a universal meaning.

Never send confidential exports to a remote assistant or third-party service unless your organization has approved that transfer.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| The browser is blank | Run `npm.cmd run build`. If it fails, fix the displayed error first. Restart `npm.cmd run dev`, then open the exact localhost URL from the terminal. |
| An XLSX is rejected for formulas | Create a copy, paste values into a new visible sheet, save it, and import that copy. Do not remove data from your source file. |
| Columns are not recognized | Map them manually and use stable names such as `asset_code`, `channel`, `date`, `impressions`, `clicks`, `orders`, `revenue`, or `spend`. Open an issue with a redacted header row if a common export is missing. |
| Numbers are wrong | Confirm decimal separators, currency units, date range, time zone, and whether revenue is gross/net or attributed/realtime. |
| A custom platform cannot be compared | Import it, retain its source and attribution context, then compare only compatible rows. Add its definition to your own metric notes. |
| A batch was imported incorrectly | Use the import-history rollback for that exact batch. Do not delete the local database as a first response. |
| Database commands fail | Keep the database local, run `npm.cmd run db:check`, and include the redacted error output in a support request. |

For unresolved issues, see [SUPPORT.md](../SUPPORT.md). For a suspected vulnerability, do **not** file a public bug; follow [SECURITY.md](../SECURITY.md).

