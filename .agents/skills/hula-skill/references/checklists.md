# Engineering Checklists & Verification Gates

**Project**: Matrix Customer Service (`matrix-customer-service-vite`)  
**Standard**: Strict Version Control Governance & Code Quality

---

## 1. Feature & Bug-Fix Development Checklist

### 1.1 Separation of Concerns Check
- [ ] No direct `axios.get()`, `fetch()`, or raw HTTP requests inside `.vue` files.
- [ ] No direct Matrix client event listeners attached inside `.vue` files.
- [ ] TanStack Query keys are centralized in service key factories (e.g. `postKeys.lists()`), never empty `queryKey: []`.
- [ ] Complex data formatting and business logic reside in `src/services/` or `src/common/composables/`.

### 1.2 Component & Style Standards
- [ ] Component uses `<script setup lang="ts">`.
- [ ] SFC order is strictly: 1. `<script setup>`, 2. `<template>`, 3. `<style scoped>`.
- [ ] Component content in `<script>` and `<style>` is indented by 2 spaces (`vueIndentScriptAndStyle: true`).
- [ ] Multi-word component name (e.g. `HomePage.vue`, `UserBadge.vue`).
- [ ] Zero usage of `any`.
- [ ] Public functions declare explicit return types.
- [ ] All UI primitives in `@/components/ui/` import `cn` from `@/common/libs/utils`.
- [ ] Imports are organized in 4 blocks with path aliases (`@/`).

### 1.3 Security & Git Hygiene
- [ ] No secrets, Matrix session tokens, API keys, or `.env` files are tracked in git.
- [ ] No stray `console.log` statements, commented-out debug code, or temporary mock blocks.
- [ ] Changes remain in working tree; **AI agents never run `git commit` or `git push` without explicit human instruction**.

---

## 2. The Mandatory 3-Step Post-Work Verification Protocol

> [!IMPORTANT]
> **NEVER skip this protocol.** Whenever a feature is completed or a bug fix is resolved, the work is **NOT considered done** until this 3-step verification sequence is executed in full.
> 
> When reporting completion, you must display each step's verification status **with its designated emoji one by one**:
> ```
> 1. 🔍 Review: [Passed / Findings]
> 2. 🎨 Style:  [Passed / Format status]
> 3. 🏗️ Build:  [Passed / Compile status]
> ```

### 🔍 Step 1: Review (Code & Architecture Inspection)
```bash
git status
git diff
```
- Verify working tree diffs.
- Confirm separation of concerns (custom functions outside UI).
- Ensure no `.env` or sensitive credentials leaked.
- Verify zero unused variables or dead code leftovers.

### 🎨 Step 2: Style (Linter & Formatter Verification)
```bash
pnpm run format:check
pnpm run eslint
```
- Ensure 100% Prettier compliance (double quotes `"..."`, semicolons `;`, 2-space indentation).
- Ensure 0 ESLint errors and 0 ESLint warnings.
- If formatting errors exist, run `pnpm run format` to auto-fix, then re-check.

### 🏗️ Step 3: Build (Strict Type Check & Bundle Verification)
```bash
pnpm run build
```
- Verifies `vue-tsc -b` type checking passes with 0 compiler errors.
- Verifies `vite build` bundles cleanly with 0 asset resolution warnings.
