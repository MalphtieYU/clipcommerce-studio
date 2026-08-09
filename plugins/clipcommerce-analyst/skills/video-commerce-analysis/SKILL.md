---
name: video-commerce-analysis
description: Analyze local CSV/XLSX exports for video-commerce performance. Use when a user asks to understand short-video, paid video, TikTok Shop, marketplace, Shopify, Meta Ads, YouTube/Google Ads, or other commerce-performance data; identify funnel bottlenecks; compare creatives; or prepare a data-backed review.
---

# Video Commerce Analysis

Use this skill only with files and account exports the user is authorized to share. Do not request platform passwords, API keys, customer-level personal data, or raw media unless they are necessary and explicitly supplied.

## Workflow

1. Inspect the file structure, date range, platform, currency, metric labels, reporting level (creative, ad, ad group, campaign, product, or store), and attribution timing.
2. State which fields are missing or non-comparable before calculating anything. Never turn missing values into zero.
3. Map the data into a funnel appropriate to the export:
   - Video: impressions → views/engagements → watch quality → clicks.
   - Commerce: product clicks → add to cart → checkout/order → payment/revenue.
   - Paid efficiency: spend → cost metrics → attributed conversions/revenue → ROAS.
4. Keep platform-native definitions intact. Specifically distinguish attributed conversions from real-time conversions, and do not compare organic view counts with paid-view definitions without a warning.
5. Compare only records with compatible platform, campaign goal, date window, attribution setting, placement, audience, and creative length. Flag smaller samples as directional rather than conclusive.
6. Return: data-quality notes, facts, plausible causes separated from facts, prioritized test ideas, and the exact next export fields needed for a stronger conclusion.

## Required output structure

- **Data readiness:** source, date range, rows, grain, missing fields, and comparability warnings.
- **Funnel:** counts/rates at each available stage and the largest observed drop-off.
- **Creative read:** hook, retention/watch quality, CTA/product transition, and conversion signal; never invent visual observations if no video or transcript was supplied.
- **Actions:** up to three testable changes, each with the metric, comparison group, and decision rule.
- **Limits:** attribution, lag, refunds, sample size, or platform-definition limitations.

## Metric safety

- CTR = clicks / impressions only when both share the same reporting scope.
- CVR must name its denominator and event (for example, paid orders / product clicks). Do not silently equate it with a platform's estimated conversion rate.
- ROAS is attributed revenue / spend. It is not profit and should not be equated to a payment ROI or net revenue without explicit source definitions.
- Keep `transactionAmount`, `GMV`, revenue, refunds, and net sales separate unless the export documents them as the same field.
- For video ads, retention and view definitions vary by placement and format. Use platform-native exported values rather than recomputing a universal view rate.
