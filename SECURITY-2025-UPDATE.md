## Security Advisory — React/Next.js RSC Vulnerability (CVE-2025-55182 / CVE-2025-66478)

Date: 2025-12-06

Affected components:
- Frontend: Next.js app using React 19.x (RSC)

Summary:
Under certain conditions, crafted requests targeting React Server Components (RSC) in React 19 and the Next.js framework could cause unintended remote code execution (CVE-2025-55182 / CVE-2025-66478).

Actions taken in this repository:
- Bumped `frontend` dependencies to newer minor patch versions for Next and React which include vendor fixes (see `frontend/package.json`).
- Updated `eslint-config-next` to align with the upgraded Next.js version.
- Added this advisory to document the package update and give instructions for further validation.

Recommended next steps:
1. Verify the official release notes and change logs for Next.js and React for the exact patched versions and adjust versions accordingly.
2. Run `pnpm install` (or your package manager) and `pnpm build` to ensure there are no build breaks.
3. For production deployments, upgrade your deployed images and restart the services after verifying the update in a staging environment.
4. Add automated dependency scanning (like Dependabot or GitHub Advanced Security) and a policy for high/critical vuln updates.
5. If you are unable to update immediately, consider restricting public access to the application while evaluating the patch.

Commands to validate locally:
```fish
cd frontend
pnpm install
pnpm build
``` 

Contact:
- If you have any concerns about the remediation or need help with the upgrade, open an issue or contact the repo owner.
