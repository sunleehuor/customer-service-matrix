# Project Architecture & Ecosystem Overview

**Project**: Matrix Customer Service (`matrix-customer-service-vite` / `customer-service-matrix`)  
**Standard**: Vue 3 + TypeScript Strict Engineering Guidelines

---

## 1. Clean 4-Layer Architecture

This project enforces strict separation of concerns across 4 discrete layers:

```
┌────────────────────────────────────────────────────────┐
│ 1. Presentation Layer (UI Only)                        │
│    - src/pages/*.vue (Route entrypoints)               │
│    - src/components/ui/ (Atomic headless primitives)   │
│    - src/components/common/ (Shared layout/domain)     │
└──────────────────────────┬─────────────────────────────┘
                           │ Consumes reactive state & actions
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Reactive Application Layer (Composables)           │
│    - src/common/composables/use*.ts                    │
│    - TanStack Query hooks, reactive chat/matrix state  │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls typed services & matrix libs
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Service & API Layer (Pure Async Business Functions) │
│    - src/services/*.service.ts                         │
│    - Pure functions executing HTTP requests            │
│    - TanStack Query key factories                      │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls HTTP singleton & pure utils
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Infrastructure & Utilities                          │
│    - src/common/libs/api.ts (Axios client singleton)   │
│    - src/common/libs/matrix/ (Matrix client helpers)   │
│    - src/common/libs/utils.ts (cn class merger)        │
│    - src/common/libs/router.ts, i18n.ts, env.ts        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Vue** | ^3.5.44 | Frontend reactive framework (`<script setup lang="ts">`) |
| **Vite** | ^8.3.6 | Next-generation build tool & dev server |
| **TypeScript** | ~6.0.3 | Strict type checking with `vue-tsc` |
| **Tailwind CSS** | ^4.3.5 | Utility-first CSS (`@tailwindcss/vite` + OKLCH design tokens) |
| **Shadcn Vue / Reka UI** | ^2.11.0 | Accessible headless atomic component primitives |
| **TanStack Vue Query** | ^5.107.1 | Asynchronous server-state management & caching |
| **TanStack Vue Virtual** | ^3.13.52 | 60FPS list virtualization for chat message feeds |
| **matrix-js-sdk** | ^45.1.0 | Matrix client protocol integration |
| **Axios** | ^1.21.1 | HTTP client singleton |
| **Vue Router** | ^5.5.0 | Web history routing |
| **Vue I18n** | ^11.4.19 | Internationalization |
| **Husky** | ^9.1.7 | Git pre-commit enforcement gate |
| **ESLint + Prettier** | Flat Config | Automated linting & code formatting |

---

## 3. Directory Layout & Conventions

```text
customer-service-matrix/
├── .agents/skills/            # Agent skills (hula-skill, shadcn, tailwindcss, etc.)
├── .husky/                    # Git pre-commit hooks
├── docs/                      # Authoritative architectural documentation
│   ├── README.md
│   ├── coding-style.md
│   ├── separation-of-concerns.md
│   ├── shadcn-and-ui-structure.md
│   ├── git-workflow-and-rules.md
│   └── code-review.md
├── src/
│   ├── assets/                # Static image/media assets
│   ├── common/
│   │   ├── composables/       # Layer 2: Reactive composables (useChatRoom.ts, usePostsQuery.ts)
│   │   ├── constants/         # Global constants (app.constant.ts)
│   │   ├── libs/              # Layer 4: Infrastructure (api.ts, env.ts, i18n.ts, router.ts, utils.ts)
│   │   │   └── matrix/        # Matrix protocol helpers (matrix.ts, matrix-message.ts, matrix-room.ts)
│   │   ├── locales/           # Translation message files (en.ts, zh-Hans.ts)
│   │   └── providers/         # Global providers (ProviderWrapper.vue, MatrixClientProvider.vue)
│   ├── components/
│   │   ├── ui/                # Layer 1: Shadcn atomic primitives (Button, Input, Dialog)
│   │   └── common/            # Layer 1: Shared domain components (VirtualList.vue, HeaderNavbar.vue)
│   ├── pages/                 # Layer 1: Route entrypoint views (HomePage.vue, ChatPage.vue)
│   ├── services/              # Layer 3: Pure async HTTP functions & query keys (post.service.ts)
│   ├── types/                 # Shared TypeScript interfaces & types (virtual-list.ts)
│   ├── App.vue                # Root application component
│   ├── main.ts                # Application boot entrypoint
│   └── style.css              # Tailwind v4 theme tokens & styles
├── .env.example               # Safe environment variable placeholders (NO secrets)
├── components.json            # Shadcn configuration & path aliases
├── eslint.config.ts           # ESLint 9 Flat Config
└── package.json               # Dependencies and scripts
```

---

## 4. Configured Path Aliases

Always use path aliases rather than deep relative paths:
- `@/` -> `src/`
- `@/components` -> `src/components`
- `@/components/ui` -> `src/components/ui`
- `@/components/common` -> `src/components/common`
- `@/common/composables` -> `src/common/composables`
- `@/common/libs` -> `src/common/libs`
- `@/services` -> `src/services`
- `@/types` -> `src/types`
