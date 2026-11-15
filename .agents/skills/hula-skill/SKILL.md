---
name: hula-skill
description: "Customer Service Matrix project skill: Vue 3, Vite, TypeScript strict, Tailwind CSS v4, Shadcn Vue (Reka UI), TanStack Vue Query, TanStack Virtual, and matrix-js-sdk integration. Use when working on customer-service-matrix, Matrix chat client, components, composables, services, or following project coding style and architecture."
---

# Customer Service Matrix Engineering Skill

## 1. Project Overview

This skill guides development on the **Matrix Customer Service** application (`customer-service-matrix` / `matrix-customer-service-vite`). It enforces strict architectural layering, TypeScript standards, Prettier/ESLint rules, Matrix SDK lifecycle patterns, and safety verification protocols.

### Key Tech Stack
- **Framework**: Vue 3 (v3.5+ `<script setup lang="ts">`)
- **Build Tool**: Vite 8
- **Language**: TypeScript 6 (`vue-tsc -b` strict type safety)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` + OKLCH design tokens)
- **UI Primitives**: Shadcn Vue (Reka UI) in `@/components/ui/`
- **Virtualization**: TanStack Vue Virtual v3 for high-performance chat feeds
- **Server State**: TanStack Vue Query v5 for caching and async data fetching
- **Matrix Integration**: `matrix-js-sdk` v45 client singleton in `@/common/libs/matrix/`
- **Routing & i18n**: Vue Router 5 (Web history), Vue I18n 11

---

## 2. Clean 4-Layer Architecture (Separation of Concerns)

All business logic, API requests, state mutations, and custom functions must live **OUTSIDE** the UI layer:

| Layer | Directory | Can Contain | CANNOT Contain |
| :--- | :--- | :--- | :--- |
| **1. UI (Presentation)** | `src/pages/`, `src/components/` | Templates, HTML, Tailwind classes, event bindings, consuming composables | `axios.get()`, `fetch()`, direct matrix event listeners, complex data formatting |
| **2. Composables** | `src/common/composables/` | `useQuery()`, `useMutation()`, `ref()`, `computed()`, Matrix listener lifecycle | Raw HTML templates, scoped CSS styles |
| **3. Services** | `src/services/` | Async API functions, DTO typings, TanStack Query key factories | Vue reactivity (`ref`, `computed`), template code |
| **4. Libs & Utils** | `src/common/libs/` | Pure helpers (`cn`), client singletons (`api.ts`, `matrix/`), routing, i18n | Domain business logic, UI state |

---

## 3. Coding Style & Formatting Rules

- **SFC Structure**: `<script setup lang="ts">` first, `<template>` second, `<style scoped>` third (prefer Tailwind utilities).
- **Prettier Settings** (`.prettierrc`):
  - `semi: true` (Semicolons required)
  - `singleQuote: false` (**Double quotes `"..."` required**)
  - `tabWidth: 2`, `useTabs: false` (**2 spaces indentation, tabs forbidden**)
  - `vueIndentScriptAndStyle: true` (**2-space indentation inside `<script>` and `<style>` in `.vue` files**)
  - `trailingComma: "all"`, `printWidth: 80`, `arrowParens: "always"`
- **TypeScript**:
  - Zero `any` allowed (use `unknown` with narrowing or typed interfaces).
  - Use `interface` for data objects/DTOs/props; `type` for unions/primitives.
  - Explicit return types required for all public functions, services, and composables.
- **Import Ordering** (4 distinct blocks separated by newlines):
  1. Third-party packages (`vue`, `vue-router`, `@tanstack/vue-query`, `matrix-js-sdk`)
  2. Internal UI components (`@/components/ui/...`, `@/components/common/...`)
  3. Application logic & composables (`@/common/composables/...`, `@/services/...`)
  4. Types, utilities & assets (`@/common/libs/...`, `@/types/...`)
- **Naming Conventions**:
  - Components: PascalCase, multi-word (e.g. `HomePage.vue`, `ChatPage.vue`, `VirtualList.vue`).
  - Composables: camelCase with `use` prefix (e.g. `useChatRoom.ts`, `usePostsQuery.ts`).
  - Services: kebab-case with `.service.ts` (e.g. `post.service.ts`).
  - Types/Utilities: kebab-case (e.g. `virtual-list.ts`, `utils.ts`).

---

## 4. UI Primitives & Design System (`src/components/ui/`)

- `@/components/ui/` is strictly for headless presentation-only primitives (Button, Input, Dialog).
- Components must NEVER contain API calls, business logic, or Matrix event bindings.
- Always use the centralized `cn` class merger: `import { cn } from "@/common/libs/utils";`.
- Maintain barrel exports in `index.ts` for every component primitive folder.
- Place shared layout and domain components under `src/components/common/`.

---

## 5. Matrix JS SDK Client Usage

- Matrix client lifecycle is managed in `src/common/libs/matrix/matrix.ts` via `initialize(config)` and `stop()`.
- Room queries are in `matrix-room.ts` (`getRoomById`, `getRooms`, `autoJoinRoom`).
- Timeline & pagination queries are in `matrix-message.ts` (`getRoomTimelineEvents`, `paginateRoomTimeline`).
- Components consume Matrix data through reactive composables (e.g. `useChatRoom.ts`) that register and clean up listeners (`RoomEvent.Timeline`).
- **NEVER** hardcode Matrix tokens, passwords, or credentials in source code. Keep credentials in `.env` (ignored by git).

---

## 6. Templates & Utilities

Templates are provided in `assets/templates/`:
- `page-view.vue`: Standard Vue 3 page SFC consuming composables and UI primitives.
- `service.ts`: Pure async HTTP service with TanStack query key factory.
- `composable-query.ts`: Composable hook wrapping TanStack `useQuery`.
- `matrix-helper.ts`: Typed Matrix client helper function.
- `ui-primitive.vue`: Shadcn UI atomic primitive with standard `cn` merging.

Layout inspection script:
- `scripts/hula_summary.py`: Run `python3 .agents/skills/hula-skill/scripts/hula_summary.py` to inspect project architecture counts.

---

## 7. Mandatory 3-Step Verification Protocol & Safety Policies

> [!IMPORTANT]
> **No Autonomous Commits**: AI agents must **NEVER** run `git commit` or `git push` autonomously without explicit user permission. All changes must remain in the working tree for human review.
> 
> Whenever a task, feature, or fix is finished, you must run the 3-step verification protocol and report status **with each emoji one by one**:
> ```
> 1. 🔍 Review: [Passed / Findings]
> 2. 🎨 Style:  [Passed / Format status]
> 3. 🏗️ Build:  [Passed / Compile status]
> ```

1. 🔍 **Review**: Run `git status` and `git diff`. Verify separation of concerns (custom functions outside UI). Ensure no secrets, tokens, stray `console.log`, or dead code exist.
2. 🎨 **Style**: Run `pnpm run format:check` and `pnpm run eslint` (or `npm.cmd run ...` on Windows). Ensure 100% Prettier compliance and 0 ESLint errors/warnings.
3. 🏗️ **Build**: Run `pnpm run build` (`vue-tsc -b && vite build`). Ensure 0 TypeScript errors and clean bundling.
