# Shadcn UI Architecture & Component Guidelines

**Project**: Matrix Customer Service (`matrix-customer-service-vite`)  
**Design System Base**: [shadcn-vue](https://shadcn-vue.com/) + [Reka UI](https://reka-ui.com/) + [Tailwind CSS v4](https://tailwindcss.com/)

---

## 1. What is Shadcn UI in this Project?

Unlike traditional component libraries (e.g., Element Plus, Vuetify), **shadcn-vue is not an npm dependency**. It is a pattern where component source code lives directly inside your repository under `@/components/ui/`.

Because you own the code, you have complete control over styling, behavior, and accessibility. However, maintaining architectural integrity requires strict boundaries between **primitive UI components** and **domain/feature components**.

---

## 2. Directory & Component Classification

```text
src/
├── components/
│   ├── ui/                    <-- 1. Shadcn Atomic UI Primitives (PURE UI ONLY)
│   │   ├── button/
│   │   │   ├── Button.vue
│   │   │   └── index.ts
│   │   ├── input/
│   │   │   ├── Input.vue
│   │   │   └── index.ts
│   │   └── dialog/
│   │       ├── Dialog.vue
│   │       ├── DialogContent.vue
│   │       └── index.ts
│   │
│   └── common/                <-- 2. Shared Domain & Layout Components
│       ├── HeaderNavbar.vue
│       ├── SidebarNav.vue
│       └── EmptyState.vue
│
├── features/                  <-- 3. Feature-Scoped Modules
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatWindow.vue
│   │   │   ├── MessageBubble.vue
│   │   │   └── MessageInputBar.vue
│   │   ├── composables/
│   │   └── services/
│   └── ticket/
│       └── components/
│
└── pages/                     <-- 4. Page Views (Route Entrypoints)
    ├── HomePage.vue
    └── AboutPage.vue
```

---

## 3. Strict Rules for `src/components/ui/`

### Rule 1: Zero Business Logic or API Calls
`src/components/ui/` components must be **100% presentation-only and headless**:
- ❌ **NEVER** import `api.ts`, Axios, or call HTTP endpoints inside `components/ui/`.
- ❌ **NEVER** import TanStack Query (`useQuery`, `useMutation`) inside `components/ui/`.
- ❌ **NEVER** reference Matrix protocol logic, user sessions, or business models.
- ✅ **ONLY** accept props (`variant`, `size`, `class`, `disabled`, `asChild`) and emit standard UI events (`click`, `update:modelValue`).

### Rule 2: Keep Barrel Exports (`index.ts`)
Every UI component directory must contain an `index.ts` file that exports:
1. The component itself.
2. The `buttonVariants` (or relevant `cva` definition).
3. The TypeScript variant types.

```ts
// src/components/ui/button/index.ts
export { default as Button } from "./Button.vue";
export { buttonVariants, type ButtonVariants } from "./variants";
```

Consumers must import from the folder barrel:
```ts
// ✅ RECOMMENDED
import { Button } from "@/components/ui/button";

// ❌ AVOID direct component file imports
import Button from "@/components/ui/button/Button.vue";
```

### Rule 3: Always Use `cn()` via `@/common/libs/utils`
Class merging must always pass through the project's standard `cn()` utility:
```vue
<script setup lang="ts">
  import { cn } from "@/common/libs/utils";
  import { buttonVariants } from ".";

  const props = defineProps<Props>();
</script>

<template>
  <button :class="cn(buttonVariants({ variant, size }), props.class)">
    <slot />
  </button>
</template>
```

---

## 4. Design Tokens & Styling (Tailwind CSS v4)

Tokens are configured in [`src/style.css`](file:///D:/frontend/matrix-customer-service-vite/src/style.css) using Tailwind v4 `@theme inline` and OKLCH color palettes.

### Available Semantic Color Tokens
Always use semantic color utility classes rather than hardcoded colors:

| Purpose | Background Utility | Text Utility | Border Utility |
| :--- | :--- | :--- | :--- |
| **Primary Actions** | `bg-primary` | `text-primary-foreground` | `border-primary` |
| **Secondary Elements** | `bg-secondary` | `text-secondary-foreground` | `border-secondary` |
| **Muted / Subdued** | `bg-muted` | `text-muted-foreground` | `border-muted` |
| **Accent / Hover** | `bg-accent` | `text-accent-foreground` | `border-accent` |
| **Destructive / Error** | `bg-destructive` | `text-white` | `border-destructive` |
| **Cards & Containers** | `bg-card` | `text-card-foreground` | `border-border` |
| **Surface / Background**| `bg-background` | `text-foreground` | `border-border` |

---

## 5. Adding New Shadcn Components

To add a new shadcn component:
1. Refer to the configured `components.json` aliases:
   ```json
   "aliases": {
     "components": "@/components",
     "utils": "@/common/libs/utils",
     "ui": "@/components/ui",
     "lib": "@/common/libs",
     "composables": "@/common/composables"
   }
   ```
2. Verify that any imported utility uses `@/common/libs/utils`.
3. Check that `vue-tsc -b` passes without type errors after adding the component.
