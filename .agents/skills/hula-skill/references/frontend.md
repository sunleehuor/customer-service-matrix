# Frontend Engineering Guide

**Project**: Matrix Customer Service (`matrix-customer-service-vite`)  
**Standard**: Vue 3 + TypeScript Strict Engineering Guidelines

---

## 1. Single-File Component (SFC) Standards

### 1.1 Script Setup as Standard
All Single-File Components must use `<script setup lang="ts">`. Options API or `defineComponent` wrapper syntax without `<script setup>` is prohibited.

### 1.2 Component Section Ordering
SFC sections must strictly follow this order:
1. `<script setup lang="ts">`
2. `<template>`
3. `<style scoped>` (Prefer Tailwind CSS utilities over custom scoped styles)

### 1.3 Strict Type-Driven Props and Emits
- Always use TypeScript type definitions inside `defineProps<Props>()` and `defineEmits<Emits>()`.
- Do not use runtime array syntax (e.g. `defineProps(['title'])`).
- Supply default values with `withDefaults(...)`.

```vue
<!-- ✅ RECOMMENDED COMPONENT STRUCTURE -->
<script setup lang="ts">
  import { computed } from "vue";
  import { Button } from "@/components/ui/button";

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

  const formattedTitle = computed(() => props.title.trim());
</script>

<template>
  <div class="rounded-md border p-4">
    <h2 class="text-lg font-semibold">{{ formattedTitle }}</h2>
    <Button @click="emit('update', props.count + 1)">Increment</Button>
  </div>
</template>
```

---

## 2. ESLint & Prettier Formatting Rules

Formatting is strictly governed by `.prettierrc` and ESLint 9 Flat Config:

| Rule | Setting | Enforcement |
| :--- | :--- | :--- |
| **`semi`** | `true` | Semicolons are required at end of statements. |
| **`singleQuote`** | `false` | **Double quotes (`"..."`)** must be used for JS/TS strings. Single quotes are prohibited. |
| **`tabWidth`** | `2` | Indentation must be **2 spaces**. Tabs (`useTabs: false`) are forbidden. |
| **`trailingComma`** | `"all"` | Trailing commas required in multi-line objects/arrays/args. |
| **`printWidth`** | `80` | Wrap lines at 80 characters. |
| **`vueIndentScriptAndStyle`** | `true` | Content inside `<script>` and `<style>` in `.vue` files **must be indented by 2 spaces**. |

---

## 3. TypeScript Rules

- **Zero `any`**: Do not use `any`. Use `unknown` with type narrowing (e.g., `typeof`, `instanceof`) or declare explicit TypeScript interfaces.
- **Interface vs Type**:
  - Use `interface` for object models, DTOs, entity definitions, and component prop definitions.
  - Use `type` for unions, primitives, intersections, tuple types, or utility transformations.
- **Explicit Return Types**: All public utility functions, API services, and composables must declare an explicit return type.

---

## 4. Import Conventions & Ordering

Organize imports into 4 distinct blocks separated by a single newline:
1. **Third-party / Node built-in packages** (`vue`, `vue-router`, `@tanstack/vue-query`, `matrix-js-sdk`)
2. **Internal UI Components** (`@/components/ui/...`, `@/components/common/...`)
3. **Application logic & composables** (`@/common/composables/...`, `@/services/...`)
4. **Types, Utilities & Assets** (`@/common/libs/...`, `@/types/...`, styles)

```ts
// 1. External dependencies
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import type { MatrixEvent } from "matrix-js-sdk";

// 2. UI Components
import { Button } from "@/components/ui/button";
import VirtualList from "@/components/common/VirtualList.vue";

// 3. Application logic & composables
import { useChatRoom } from "@/common/composables/useChatRoom";

// 4. Utils and types
import { cn } from "@/common/libs/utils";
import type { VirtualSnapshot } from "@/types/virtual-list";
```

---

## 5. UI Primitives vs Domain Components

- **`src/components/ui/`**: 100% presentation-only primitives (Button, Input, Dialog). Must NEVER contain network calls or Matrix domain logic. Always export via barrel `index.ts` and merge classes via `cn` from `@/common/libs/utils`.
- **`src/components/common/`**: Shared domain and layout components (e.g. `VirtualList.vue`, navbar, sidebar).
- **`src/pages/`**: Route entrypoint views (e.g. `HomePage.vue`, `ChatPage.vue`). Must remain thin and consume reactive state from composables.
