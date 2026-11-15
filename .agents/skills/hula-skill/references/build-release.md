# Build, Scripts & Git Verification Guide

**Project**: Matrix Customer Service (`matrix-customer-service-vite`)

---

## 1. Project Commands & Scripts

All commands are defined in [`package.json`](file:///home/lee/app/project/frontend/customer-service-matrix/package.json):

```bash
# Development server (Vite 8)
pnpm dev

# Type check and production build (vue-tsc -b && vite build)
pnpm build

# Preview production build locally
pnpm preview

# Run ESLint across entire codebase
pnpm eslint

# Run Prettier check across codebase
pnpm format:check

# Auto-format all supported files with Prettier
pnpm format

# Git hook setup (Husky)
pnpm prepare
```

*(On Windows PowerShell, use `npm.cmd` or `pnpm.cmd` if script execution policies block direct script calls).*

---

## 2. Git Pre-Commit Hook (`.husky/pre-commit`)

The repository uses Husky v9 to prevent committing broken, unformatted, or unverified code:

```sh
pnpm run format:check && pnpm run eslint && pnpm exec vue-tsc -b
```

Every commit must satisfy:
1. `format:check`: Prettier compliance (2 spaces, double quotes, semicolons).
2. `eslint`: Zero ESLint errors or warnings.
3. `vue-tsc -b`: Zero TypeScript compiler or SFC template errors.

---

## 3. Autonomous Git Safety Rules ("No Autonomous Commits")

- **AI Agents must never run `git commit` or `git push` automatically** unless the human user explicitly instructs them to do so.
- Changes must remain staged or unstaged in the local working directory for human developer review.
- Never commit `.env` or credential files to git. Keep `.env` strictly local.
