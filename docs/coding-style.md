# Coding Style & Engineering Conventions

**Project**: Matrix Customer Service (`matrix-customer-service-vite`)  
**Standard**: Vue 3 + TypeScript Strict Engineering Guidelines

---

## 1. Vue 3 Component Conventions

### 1.1 Script Setup as Standard
All Single-File Components (SFCs) must use `<script setup lang="ts">`. Options API or `defineComponent` wrapper syntax without `<script setup>` is prohibited.

```vue
<!-- ✅ RECOMMENDED -->
<script setup lang="ts">
  import { ref, computed } from "vue";

  interface Props {
    title: string;
    count?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    count: 0,
  });

  const emit = defineEmits<{
    (e: "update", value: number): void;
    (e: "close"): void;
  }>();
</script>

<template>
  <div class="user-card">
    <h2>{{ props.title }}</h2>
  </div>
</template>
```

### 1.2 Component Section Ordering
SFC sections must strictly follow this order:
1. `<script setup lang="ts">`
2. `<template>`
3. `<style scoped>` (Only if Tailwind utilities cannot satisfy requirements; prefer Tailwind CSS)

### 1.3 Strict Type-Driven Props and Emits
- Always use TypeScript type definitions inside `defineProps<T>()` and `defineEmits<T>()`.
- Do not use runtime array syntax (e.g. `defineProps(['title'])`).
- Use `withDefaults` to supply default values.

---

## 2. TypeScript Conventions

### 2.1 No `any`
- The use of `any` is strictly discouraged.
- Use `unknown` with type narrowing (e.g., `typeof`, `instanceof`, or Zod/type guards) when data shape is uncertain.
- If a 3rd-party library lacks types, declare a `.d.ts` module or interface rather than falling back to `any`.

### 2.2 Interface vs Type Alias
- Use **`interface`** for object models, DTOs, entity definitions, and component prop definitions.
- Use **`type`** for unions, primitives, intersections, tuple types, or utility transformations.

```ts
// ✅ Interface for data objects
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

// ✅ Type for unions and mapped types
export type UserStatus = "online" | "offline" | "away" | "busy";
```

### 2.3 Explicit Return Types for Shared Functions
All public utility functions, API services, and composables must declare an explicit return type to prevent accidental type regressions and improve IDE intellisense.

```ts
// ✅ Explicit return type
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
```

---

## 3. Naming Conventions

| Category | Convention | Examples |
| :--- | :--- | :--- |
| **Vue Components** | PascalCase | `UserProfileCard.vue`, `NavbarHeader.vue`, `HomePage.vue` |
| **Composables** | camelCase with `use` prefix | `useAuthSession.ts`, `useCustomerChat.ts` |
| **API Services** | kebab-case / camelCase with `.service.ts` | `auth.service.ts`, `chat.service.ts` |
| **Utility Files** | kebab-case or camelCase | `utils.ts`, `date-formatter.ts` |
| **Types / Interfaces** | PascalCase | `ChatMessage`, `SessionState`, `ApiEnvelope<T>` |
| **Constants / Enums** | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE`, `MAX_RETRIES` |
| **Route Names** | PascalCase or kebab-case | `'Home'`, `'About'`, `'ChatSession'` |

---

## 4. Import Conventions & Path Aliases

### 4.1 Path Aliases
Always use configured path aliases (`@/`) instead of fragile relative paths (`../../`):
- `@/` -> `src/`
- `@/components` -> `src/components`
- `@/components/ui` -> `src/components/ui`
- `@/common/composables` -> `src/common/composables`
- `@/common/libs` -> `src/common/libs`
- `@/services` -> `src/services`

```ts
// ❌ Avoid deep relative paths and explicit TS extensions
import { router } from "./common/libs/router.tsx";
import Button from "../../components/ui/button/Button.vue";

// ✅ Use aliases and barrel exports
import { router } from "@/common/libs/router";
import { Button } from "@/components/ui/button";
```

### 4.2 Import Ordering
Organize imports into 4 distinct blocks separated by a single newline:
1. **Third-party / Node built-in packages** (`vue`, `vue-router`, `@tanstack/vue-query`, `lucide-vue-next`)
2. **Internal UI Components** (`@/components/ui/...`, `@/components/common/...`)
3. **Application logic** (Composables, Services, Stores)
4. **Types, Utilities & Assets** (`@/common/libs/...`, `@/types/...`, styles/images)

```ts
// 1. External dependencies
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { SendIcon } from "lucide-vue-next";

// 2. UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 3. Application logic & services
import { useChatMessages } from "@/common/composables/useChatMessages";

// 4. Utils and types
import { cn } from "@/common/libs/utils";
import type { ChatMessage } from "@/types/chat.types";
```

---

## 5. ESLint & Prettier Standards & Enforcement

Code style and formatting are strictly governed by **ESLint (Flat Config)** and **Prettier**. Every developer and agent must adhere to these rules before proposing or checking in any code.

---

### 5.1 Prettier Configuration (`.prettierrc`)

Prettier is the single source of truth for all code formatting.

| Prettier Rule | Value | Enforcement Detail |
| :--- | :--- | :--- |
| **`semi`** | `true` | Semicolons are **always required** at the end of statements. |
| **`singleQuote`** | `false` | **Double quotes (`"..."`)** must be used for JS/TS strings. Single quotes are prohibited unless escaping. |
| **`tabWidth`** | `2` | Indentation must be **2 spaces**. Tabs (`useTabs: false`) are forbidden. |
| **`trailingComma`** | `"all"` | Trailing commas are required in multi-line objects, arrays, and function arguments. |
| **`printWidth`** | `80` | Lines must wrap at **80 characters** for readability. |
| **`bracketSpacing`** | `true` | Spaces inside object literals: `{ foo: bar }` (not `{foo: bar}`). |
| **`arrowParens`** | `"always"` | Arrow functions always require parentheses: `(x) => x` (not `x => x`). |
| **`vueIndentScriptAndStyle`** | `true` | **Inside `.vue` files**, the content of `<script>` and `<style>` blocks **must be indented by 2 spaces**. |

#### ❌ Non-Compliant Code (Fails Prettier):
```ts
// ❌ Single quotes, missing semicolons, no trailing comma, missing arrow parens
import api from '@/common/libs/api'

const routes = [
  { path: '/', component: HomePage }
]

const double = x => x * 2
```

#### ✅ Compliant Code (Passes Prettier):
```ts
// ✅ Double quotes, semicolons, trailing commas, arrow parens
import api from "@/common/libs/api";

const routes = [
  { path: "/", component: HomePage },
];

const double = (x: number) => x * 2;
```

#### ✅ Compliant `.vue` Indentation Example:
```vue
<!-- ✅ Note the 2-space indentation inside <script setup> and <style> -->
<script setup lang="ts">
  import { ref } from "vue";

  const count = ref(0);
</script>

<template>
  <button>{{ count }}</button>
</template>

<style scoped>
  button {
    cursor: pointer;
  }
</style>
```

---

### 5.2 ESLint Rules & Configuration (`eslint.config.ts`)

The project uses ESLint 9 Flat Config with `@eslint/js`, `typescript-eslint`, and `eslint-plugin-vue`.

#### 1. Vue Plugin (`pluginVue.configs["flat/essential"]`)
- **Multi-Word Component Names (`vue/multi-word-component-names`)**:
  - Component names must consist of multiple words (e.g., `HomePage.vue`, `UserBadge.vue`, `NavbarHeader.vue`).
  - Single-word names like `Home.vue`, `Header.vue`, or `Chat.vue` are prohibited (with the exception of `App.vue`).
- **Template Safety**:
  - Direct mutation of props is prohibited (`vue/no-mutating-props`).
  - Variables declared in `<script setup>` that are used in `<template>` must not be shadowed.
  - Custom events must be declared with `defineEmits`.

#### 2. TypeScript ESLint (`tseslint.configs.recommended`)
- **No `any` (`@typescript-eslint/no-explicit-any: "warn"`)**:
  - Flagged as a warning. Do not use `any`; use `unknown` or declare explicit interfaces.
- **Unused Variables**:
  - Variables declared but not used will trigger linting warnings or TypeScript compilation errors (`noUnusedLocals: true` in `tsconfig.app.json`).

#### 3. ESLint Ignore Policy
The following paths are explicitly ignored by ESLint:
```ts
ignores: [
  "dist/**",
  ".agents/**",
  "src/components/ui/**" // Shadcn UI vendor primitives
]
```
> [!NOTE]
> `src/components/ui/**` is ignored by ESLint because it contains generated/vendored shadcn-vue primitives. However, they must still satisfy Prettier formatting and TypeScript type checking (`vue-tsc -b`).

---

### 5.3 Static Analysis Execution Commands

Run the following commands locally before submitting any code:

```bash
# 1. Run ESLint across entire project
npm.cmd run eslint

# 2. Check Prettier compliance without modifying files
npm.cmd run format:check

# 3. Automatically fix Prettier formatting across src files
npm.cmd run format

# 4. Strict TypeScript compiler check
npx.cmd vue-tsc -b
```
*(On Windows PowerShell, always use `npm.cmd` or `npx.cmd` to avoid execution policy script blocks).*
