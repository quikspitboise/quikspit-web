# TypeScript toolchain

Both applications use TypeScript 7.0.2 for project checks. Run commands from the
repository's Nix dev shell:

```bash
nix develop path:.
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

`pnpm typecheck` checks both applications, including backend tests. The frontend
generates Next.js route types first, so the check also works in a fresh checkout.
Each application's build runs its TypeScript 7 check before Next.js or Nest builds.
These same build scripts run in GitHub Actions and both Vercel projects.

## Compatibility package

TypeScript 7 has no JavaScript compiler API. ESLint's TypeScript parser, Nest's
compiler, ts-jest, ts-node, and the frontend unit tests still use that API. All
three workspace manifests therefore follow Microsoft's
[side-by-side installation](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/):

- `@typescript/native` aliases `typescript@^7.0.2` and provides `tsc`.
- `typescript` aliases `@typescript/typescript6@^6.0.2`, which forwards the
  TypeScript 6 API and provides `tsc6`.

`pnpm exec tsc --version` reports 7.0.2. `pnpm exec tsc6 --version` reports the
installed TypeScript 6 version. Next.js and Nest continue using the compatibility
compiler for their own compilation steps. Do not replace the `typescript` alias
with version 7 until these API consumers support the native compiler.

## Backend module configuration

The backend uses `Node16` for both module output and resolution. Its package is
CommonJS, so Nest's output remains CommonJS with decorator metadata for dependency
injection and TypeORM. This replaces TypeScript 7's removed `node10` resolution
and `baseUrl` options. `isolatedModules` supports ts-jest's Node16 transformation;
the separate TypeScript 7 check validates the complete application and test code.

Migration commands preload `ts-node/register` through Node instead of launching
the TypeORM JavaScript CLI through `ts-node`. This keeps the TypeScript data source
on the CommonJS loader on Node 22. CI exercises migration run, show, revert, and
replay against its temporary PostgreSQL service.
