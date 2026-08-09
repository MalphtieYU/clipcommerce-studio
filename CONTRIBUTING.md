# Contributing

Thank you for helping improve ClipCommerce Studio. This project treats data definitions as product behavior: a change that makes a metric look simpler but less truthful is not an improvement.

## Start here

1. Read [the user guide](docs/USAGE.md), [security policy](SECURITY.md), and [code of conduct](CODE_OF_CONDUCT.md).
2. Create an issue before large features or metric-definition changes so scope and platform terminology can be agreed.
3. Never commit production exports, media, screenshots, account IDs, `.env` files, database files, API keys, or customer information.
4. Use synthetic or redacted data for tests and examples.

## Development workflow

```powershell
npm.cmd install
npm.cmd run db:setup
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Keep changes focused. Update both English and Chinese user-facing documentation when a workflow, metric definition, or supported platform changes. Explain any platform-specific attribution assumption, source link, and comparability limit.

## Pull requests

- Use a clear, scoped title.
- State what changed, why, how it was tested, and any user-visible data or metric impact.
- Add or update tests for behavior changes.
- Do not add generated local data or unrelated formatting changes.
- A maintainer reviews security, data boundaries, metric definitions, and documentation before merge.

For a vulnerability, use the private process in [SECURITY.md](SECURITY.md), not a pull request or public issue.
