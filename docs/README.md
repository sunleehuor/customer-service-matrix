# Project Documentation & Architecture Guides

Welcome to the **Matrix Customer Service** project documentation. This directory provides comprehensive architectural standards, code review findings, coding styles, component guidelines, and version control policies.

---

## 📚 Table of Contents

| Document | Description |
| :--- | :--- |
| **[Code Review & Audit](./code-review.md)** | Full architectural and code health audit of the current codebase, identified issues, and prioritized recommendations. |
| **[Coding Style Guide](./coding-style.md)** | TypeScript & Vue 3 coding standards, script setup conventions, naming rules, and complete ESLint + Prettier enforcement rules with code examples. |
| **[Shadcn UI Structure](./shadcn-and-ui-structure.md)** | Architectural principles for shadcn-vue, component encapsulation in `@/components/ui/`, tokens, and atomic UI design. |
| **[Separation of Concerns (Custom Functions Outside UI)](./separation-of-concerns.md)** | Strict architectural pattern moving data fetching, business logic, and custom functions out of Vue UI templates into Services and Composables. |
| **[Git Workflow & Commit Rules](./git-workflow-and-rules.md)** | Strict version control rules, the mandatory 3-step post-work verification protocol (1. 🔍 Review, 2. 🎨 Style, 3. 🏗️ Build), and "No Commit Code" policies. |

---

## 🛠 Tech Stack Overview

- **Framework**: [Vue 3](https://vuejs.org/) (v3.5+ with `<script setup lang="ts">`)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Language**: [TypeScript 6](https://www.typescriptlang.org/) (Strict typing with `vue-tsc`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + `@tailwindcss/vite` + `tw-animate-css`
- **UI System**: [Shadcn Vue](https://www.shadcn-vue.com/) based on [Reka UI](https://reka-ui.com/)
- **Data Fetching / Server State**: [TanStack Vue Query](https://tanstack.com/query/latest/docs/framework/vue/overview) (v5)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Routing**: [Vue Router 5](https://router.vuejs.org/)
- **Code Quality**: ESLint (Flat Config) + Prettier

---

## ⚡ Mandatory Post-Feature / Post-Fix Protocol

Whenever any feature or bug fix is finished, developers and agents must **NEVER** skip the 3-step verification protocol, and must report each status **emoji by emoji**:

1. 🔍 **Review**: Inspect diffs, verify separation of concerns (custom functions outside UI), check for secret leaks and dead code.
2. 🎨 **Style**: Run `npm.cmd run eslint` and `npm.cmd run format:check` to ensure 100% Prettier and ESLint compliance.
3. 🏗️ **Build**: Run `npm.cmd run build` (`vue-tsc -b && vite build`) to verify zero TypeScript or build errors.

---

## 🎯 Quick Rules Checklist for Developers

1. **Keep UI Components Pure**: Never write raw `axios.get()` or complex business logic directly in `.vue` files. Use composables and API services.
2. **Never Touch `components/ui/` for Domain Logic**: The `@/components/ui/` directory is exclusively for reusable headless design primitives.
3. **Follow ESLint & Prettier Rules**: Double quotes only (`"..."`), trailing semicolons, 2-space indentation (including inside `<script setup>` in `.vue`), and no `any`.
4. **Follow Type Safety**: Always use TypeScript interfaces and avoid `any`. Ensure `vue-tsc -b` passes before testing.
5. **Mandatory 3-Step Verification**: Always complete 1. 🔍 Review, 2. 🎨 Style, 3. 🏗️ Build before marking any feature/fix done.
6. **No Direct Commits**: Never commit directly to `main` or `develop`. Never commit without running verification scripts (`npm.cmd run eslint`, `npm.cmd run format:check`, `npm.cmd run build`).
7. **Protect Secrets**: Never commit `.env` or sensitive credentials. Keep `.env` strictly local.
