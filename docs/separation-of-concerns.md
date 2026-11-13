# Architecture Guide: Separation of Concerns (Custom Functions Outside UI)

**Project**: Matrix Customer Service (`matrix-customer-service-vite`)  
**Core Rule**: **All business logic, API requests, state management, and custom functions must live OUTSIDE the UI layer.**

---

## 1. Architectural Philosophy

A common anti-pattern in frontend projects is placing data-fetching logic, calculations, formatting functions, and state mutations directly inside `.vue` files. This creates tight coupling, makes components hard to test, causes query cache issues, and bloats component files.

This project enforces a **Clean 4-Layer Architecture**:

```
┌────────────────────────────────────────────────────────┐
│ 1. Presentation Layer (UI Only)                        │
│    - src/pages/*.vue                                   │
│    - src/components/**/*.vue                           │
└──────────────────────────┬─────────────────────────────┘
                           │ Consumes reactive state & actions
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Reactive Application Layer (Composables)           │
│    - src/common/composables/use*.ts                    │
│    - Manages TanStack Query, mutations, local state    │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls typed services
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Service & API Layer (Pure Async Business Functions) │
│    - src/services/*.service.ts                         │
│    - Pure functions executing HTTP requests            │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls HTTP singleton & pure utils
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Infrastructure & Utilities                          │
│    - src/common/libs/api.ts (Axios client)             │
│    - src/common/libs/utils.ts (Pure helpers, cn)       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Layer Responsibilities & Boundaries

| Layer | Directory | Can Contain | CANNOT Contain |
| :--- | :--- | :--- | :--- |
| **1. UI (Presentation)** | `src/pages/`, `src/components/` | Templates, HTML, Tailwind classes, event bindings, consuming composables | `axios.get()`, `fetch()`, direct localStorage access, complex data transformations |
| **2. Composables** | `src/common/composables/` | `useQuery()`, `useMutation()`, `ref()`, `computed()`, UI state management | Raw HTML, JSX templates, CSS styles |
| **3. Services** | `src/services/` | Async API functions (`getPosts()`, `createTicket()`), DTO typings, query key factories | Vue reactivity (`ref`, `computed`), template code |
| **4. Utils / Libs** | `src/common/libs/` | Pure utility functions (`formatDate`, `cn`), singleton instances (`api`, `router`) | Domain-specific business logic, UI state |

---

## 3. Practical Example: Refactoring `HomePage.vue`

### ❌ The Anti-Pattern (Current Code in `HomePage.vue`)
The component directly imports `api`, inlines `useQuery` with an empty key `queryKey: []`, and calls a hardcoded external URL:

```vue
<!-- ❌ ANTI-PATTERN: Business logic inside UI -->
<script setup lang="ts">
  import api from "@/common/libs/api";
  import Button from "@/components/ui/button/Button.vue";
  import { useQuery } from "@tanstack/vue-query";

  // Problem 1: Logic tightly coupled to UI
  // Problem 2: Empty queryKey breaks cache invalidation
  // Problem 3: Hardcoded external URL
  useQuery({
    queryKey: [],
    queryFn: () => api.get("https://jsonplaceholder.typicode.com/posts"),
  });
</script>

<template>
  <h1 class="text-red-600">Hello</h1>
  <Button> Hello </Button>
</template>
```

---

### ✅ The Standard Pattern (Custom Function Outside UI)

#### Step 1: Define the Type & Service Function (`src/services/post.service.ts`)
Create a pure service function that handles the HTTP request:

```ts
// src/services/post.service.ts
import api from "@/common/libs/api";

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// Query key factory for consistent cache management
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  detail: (id: number) => [...postKeys.all, "detail", id] as const,
};

export async function fetchPosts(): Promise<Post[]> {
  const response = await api.get<Post[]>("/posts");
  return response.data;
}
```

#### Step 2: Create the Composable Hook (`src/common/composables/usePostsQuery.ts`)
Encapsulate TanStack Query logic into a reusable composable:

```ts
// src/common/composables/usePostsQuery.ts
import { useQuery } from "@tanstack/vue-query";
import { fetchPosts, postKeys, type Post } from "@/services/post.service";

export function usePostsQuery() {
  return useQuery<Post[]>({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
```

#### Step 3: Keep the UI Component Pure (`src/pages/HomePage.vue`)
The `.vue` component now only handles presentation, states, and user interactions:

```vue
<!-- ✅ RECOMMENDED: UI is clean and purely consumes composable -->
<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import { usePostsQuery } from "@/common/composables/usePostsQuery";

  const { data: posts, isPending, isError, error, refetch } = usePostsQuery();
</script>

<template>
  <div class="container mx-auto p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">Posts Overview</h1>
      <Button :disabled="isPending" @click="() => refetch()">
        {{ isPending ? "Refreshing..." : "Refresh" }}
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="isPending" class="text-muted-foreground py-8 text-center">
      Loading posts...
    </div>

    <!-- Error State -->
    <div v-else-if="isError" class="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
      Failed to load posts: {{ error?.message }}
    </div>

    <!-- Data Display -->
    <ul v-else class="divide-y divide-border rounded-md border bg-card">
      <li v-for="post in posts" :key="post.id" class="p-4 hover:bg-muted/50 transition">
        <h3 class="font-medium text-foreground">{{ post.title }}</h3>
        <p class="text-sm text-muted-foreground mt-1">{{ post.body }}</p>
      </li>
    </ul>
  </div>
</template>
```

---

## 4. Where Do Different Functions Belong?

| Function Type | Target Location | Example |
| :--- | :--- | :--- |
| **Pure Data Transformations** | `src/common/libs/utils.ts` | `slugify()`, `formatDate()` |
| **HTTP Requests / Endpoints** | `src/services/<domain>.service.ts` | `auth.service.ts`, `ticket.service.ts` |
| **Reactive State / TanStack Hooks**| `src/common/composables/use<Name>.ts` | `useAuth.ts`, `useTicketQuery.ts` |
| **Matrix Protocol Client Helpers** | `src/common/libs/matrix/` | Matrix client session manager |
| **UI Event Handlers (Simple)** | Inline inside `<script setup>` | `const onToggle = () => isOpen.value = !isOpen.value` |
| **UI Event Handlers (Complex)** | Composable returned method | `const { submitForm } = useCheckout()` |
