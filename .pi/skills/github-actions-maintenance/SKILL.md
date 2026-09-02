---
name: github-actions-maintenance
description: Reviews and maintains GitHub Actions workflows, release automation, dependency updates, artifact publishing, and scheduled package-update jobs. Use when editing .github/workflows, action permissions, matrices, caches, releases, or gh-based CI diagnostics.
---

# GitHub Actions Maintenance

Read every affected workflow and any scripts it invokes before editing. Also inspect repository-specific `AGENTS.md`, release documentation, flake checks, and package-manager metadata.

## Retrieve current behavior

GitHub Actions syntax and official action versions change. Before introducing a field or action, verify it against official documentation or the action's repository. Prefer evidence from the repository's existing successful runs when debugging:

```fish
gh run list --limit 10
gh run view <run-id> --log-failed
```

Do not expose secrets, environment values, signed URLs, or full debug logs containing credentials.

## Security and reliability

1. Set minimal top-level or job-level `permissions`; use `contents: read` unless a job demonstrably needs more.
2. Treat pull-request code as untrusted. Never expose write tokens or secrets to untrusted fork code.
3. Avoid `pull_request_target` unless the workflow never checks out or executes untrusted pull-request content.
4. Use maintained actions and verify current major versions. For high-assurance workflows, pin third-party actions to a commit SHA and retain a version comment.
5. Put dynamic shell values through environment variables instead of interpolating untrusted expressions directly into scripts.
6. Add `timeout-minutes` to networked or potentially hanging jobs.
7. Add `concurrency` with cancellation where superseded branch/PR runs waste resources; do not cancel release publication midway.
8. Use `set -euo pipefail` only in Bash steps. Do not apply Bash syntax to PowerShell or Fish.
9. Keep cache keys tied to lockfiles and relevant toolchain versions. Never cache secrets or mutable deployment credentials.
10. Give release/publish jobs explicit environments and confirmation boundaries when appropriate.

## Repository patterns

- **Nix flakes**: prefer the repository's flake checks and existing Cachix setup. Do not update all flake inputs implicitly.
- **Containers/GHCR**: use least-privilege `packages: write`, generate deterministic tags, and avoid publishing from untrusted PRs.
- **Windows/Scoop**: preserve PowerShell semantics and validate JSON manifests and SHA256 values.
- **Cloudflare**: keep deployment separate from validation; validation should not require production credentials.
- **Release artifacts**: verify checksums and expected filenames before publishing or dispatching downstream updates.

## Verification

Validate YAML and run the repository's local workflow checks where available. Use `actionlint` when provided by the flake/dev shell. Then inspect the diff for accidental permission expansion, secret interpolation, event broadening, or changed release conditions.

When reporting, separate local validation from an actual hosted GitHub Actions run.
