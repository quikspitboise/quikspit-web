---
name: nix-repository-workflow
description: Develops, reviews, updates, and verifies Nix flakes and NixOS packages. Use when editing flake.nix, package.nix, Nix modules, fixed-output hashes, overlays, dev shells, or Nix-based CI and release automation.
---

# Nix Repository Workflow

Use the repository's flake as the source of truth. Read `AGENTS.md`, `README.md`, `flake.nix`, and package files before changing anything.

## Determine the repository type

- **Application using a Nix dev shell**: preserve the project's chosen package manager and run its commands through `nix develop -c` when practical.
- **Nix package/flake**: inspect package outputs, checks, overlays, modules, and supported systems before editing.
- **Upstream tracker**: inspect update workflows and existing hash-update scripts before changing versions or hashes.

## Rules

1. Do not run broad `nix flake update` unless the user explicitly requests all inputs to move. Prefer `nix flake lock --update-input <name>` for a targeted input.
2. Do not guess fixed-output hashes. Set the relevant hash to `lib.fakeHash` only when the normal Nix mismatch output is needed, then replace it with the reported hash.
3. Preserve reproducibility: no network access during builds and no mutable host paths in derivations.
4. Keep runtime dependencies separate from build dependencies and use existing wrapping/hooks patterns.
5. Do not add global packages to the user's NixOS system for a repository task. Use the flake dev shell, `nix shell`, or project packaging.
6. Check whether upstream artifacts are glibc, musl, AppImage, Electron, or source builds before choosing patching/wrapping strategies.
7. For NixOS modules, preserve option types, defaults, assertions, and `mkIf`/`mkMerge` behavior. Add an evaluation check where practical.
8. Respect supported systems. Do not claim cross-platform support that CI or the derivation does not exercise.

## Update workflow

1. Read the existing updater and CI workflow.
2. Identify the version source: GitHub release, tag, commit, or package registry.
3. Update one layer at a time: source version/hash, dependency/vendor hash, patches, then metadata.
4. Build the exact package output.
5. Run the flake's checks.
6. Inspect generated diffs and ensure lockfile changes are intentional.

Prefer `nix-update` when the repository already supports it. Otherwise use the repository's existing update script or a targeted manual update.

## Verification

Start with cheap checks and escalate:

```fish
nix flake show --no-write-lock-file
nix flake check --no-write-lock-file
```

For package repositories, also build the intended output:

```fish
nix build --no-write-lock-file
```

For application repositories, use the project's documented build/test command inside its development environment. Do not substitute a generic command for a blessed path in `AGENTS.md`.

Before reporting success, state exactly which outputs and checks ran. Distinguish evaluation success from a complete build and runtime validation.
