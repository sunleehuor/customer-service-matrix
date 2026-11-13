# Git Workflow & "No-Commit-Code" Safety Policies

**Project**: Matrix Customer Service (`matrix-customer-service-vite`)  
**Standard**: Strict Version Control Governance & Safety Policies

---

## 1. The Core "No Commit Code" Safety Rules

To prevent code regressions, security leaks, broken builds, and unauthorized changes, every team member and AI assistant must adhere strictly to the following rules:

### 🚫 Rule 1: No Unverified Code Commits
**Never commit code that has not passed local verification.**  
Every commit must compile cleanly and pass all static analysis checks. Committing "work in progress" that breaks the build or TypeScript compiler is prohibited.

#### Required Pre-Commit Verification Gate:
```bash
# 1. Verify TypeScript types and production build
npm.cmd run build

# 2. Verify ESLint rules
npm.cmd run eslint

# 3. Verify Prettier code format
npm.cmd run format:check
```
If ANY of these three commands fail or emit errors, **DO NOT COMMIT**. Fix the issue first.

---

### 🚫 Rule 2: No Autonomous AI Commits
**AI Agents must never run `git commit` or `git push` automatically unless the human user explicitly instructs them to do so.**
- When generating code, refactoring, or adding documentation, the AI must leave changes in the working directory for human developer review.
- The developer remains in full control of their git history.

---

### 🚫 Rule 3: Never Commit Secrets or Sensitive Files
- **Never commit `.env` or `.env.*` files.** (Only `.env.example` with blank placeholders is permitted in git).
- **Never commit credentials, access tokens, API secrets, or Matrix session tokens.**
- **Never commit private encryption keys or certificates.**

If an `.env` file is accidentally committed, it must be purged immediately from git history and any exposed credentials revoked.

---

### 🚫 Rule 4: No Direct Commits to Protected Branches
Direct commits and pushes to `main`, `master`, and `develop` are strictly prohibited.
- All work must occur on isolated feature or fix branches.
- Merging into `develop` or `main` requires a Pull Request (PR) and at least one peer code review.

---

### 🚫 Rule 5: No Blind Staging (`git add .`)
Never run `git add .` or `git add -A` blindly. Blind staging frequently leads to accidental commits of:
- Untracked `.env` files.
- Scratch scripts or temporary files.
- Large local media assets.
- Unwanted build artifacts.

**Always inspect your diff before staging:**
```bash
git status
git diff
git add <specific-file-1> <specific-file-2>
```

---

## 2. Mandatory Post-Feature & Post-Fix Workflow (The 3-Step Protocol)

> [!IMPORTANT]
> **NEVER skip this protocol.** Whenever a feature is completed or a bug fix is resolved, the work is **NOT considered done** until this 3-step verification sequence is executed in full.
> 
> When reporting completion, you must display each step's verification status **with its designated emoji one by one**:

```
1. 🔍 Review: [Passed / Findings]
2. 🎨 Style:  [Passed / Format status]
3. 🏗️ Build:  [Passed / Compile status]
```

### 🔍 Step 1: Review (Code & Architecture Inspection)
- **Check Working Tree**: Run `git status` and `git diff` to inspect every modified and added file.
- **Architectural Separation**: Verify that no raw business logic, API requests, or TanStack query keys are embedded in `.vue` files (must be outside UI in composables/services).
- **Shadcn Boundary**: Ensure `@/components/ui/` components remain 100% presentation-only and import `cn` from `@/common/libs/utils`.
- **Security Check**: Confirm no `.env` files, secrets, API tokens, or credentials are tracked.
- **Cleanliness**: Ensure no stray `console.log`, temporary commented-out blocks, or debug leftovers exist.

### 🎨 Step 2: Style (Linter & Formatter Verification)
- **Prettier Check**: Run `npm.cmd run format:check` to ensure all files strictly adhere to `.prettierrc` (double quotes `"..."`, semicolons `;`, 2-space indentation in `<script setup>`, trailing commas).
- **ESLint Check**: Run `npm.cmd run eslint` to ensure zero ESLint errors across components and TypeScript files.
- If formatting issues exist, run `npm.cmd run format` to auto-fix, then re-check.

### 🏗️ Step 3: Build (Strict Type Check & Bundle Verification)
- **TypeScript & Vite Build**: Run `npm.cmd run build` (which executes `vue-tsc -b && vite build`).
- Ensure there are:
  - 0 TypeScript compiler errors.
  - 0 template type errors.
  - 0 missing asset reference warnings (e.g. unresolvable background images).
- Verify the production bundle in `dist/` builds cleanly.

---

## 3. Branching Strategy

| Branch | Purpose | Rules |
| :--- | :--- | :--- |
| `main` | Production-ready releases | Protected. Only merges from `develop` via PR and release tagging. |
| `develop` | Integration branch for upcoming release | Protected. No direct commits. Merges via PRs. |
| `feat/<feature-name>` | New feature development | Created from `develop`. PR targets `develop`. |
| `fix/<bug-name>` | Bug fixes | Created from `develop` (or `main` for hotfixes). |
| `refactor/<scope>` | Code refactoring without behavioral change | Created from `develop`. |

---

## 4. Conventional Commit Standards

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short summary in imperative mood>

[optional body explaining why and what changed]

[optional footer(s), e.g. Closes #123]
```

### Commit Types
| Type | Meaning | Example |
| :--- | :--- | :--- |
| `feat` | A new feature | `feat(chat): implement message streaming composable` |
| `fix` | A bug fix | `fix(router): switch from memory history to web history` |
| `refactor` | Code restructuring without feature change | `refactor(home): extract posts query into composable` |
| `docs` | Documentation updates | `docs: add code review and architecture guidelines` |
| `style` | Formatting, missing semi-colons, no code change | `style: format button component with prettier` |
| `perf` | Performance improvement | `perf(virtual): virtualize chat message list rendering` |
| `test` | Adding or updating tests | `test(api): add unit tests for axios interceptor` |
| `chore` | Build tools, dependencies, config | `chore(gitignore): ignore local .env files` |

---

## 5. Post-Work Verification Checklist

Before wrapping up a task, run through the 3-step checklist:

- [ ] **1. 🔍 Review**: Checked `git diff`; ensured business logic is outside UI; verified no secrets or debug logs.
- [ ] **2. 🎨 Style**: Ran `npm.cmd run eslint` and `npm.cmd run format:check` with 0 errors.
- [ ] **3. 🏗️ Build**: Ran `npm.cmd run build` (`vue-tsc -b && vite build`) with 0 type errors.
- [ ] **No Commit**: Verified changes remain in working directory for developer review (unless explicitly directed to commit).
