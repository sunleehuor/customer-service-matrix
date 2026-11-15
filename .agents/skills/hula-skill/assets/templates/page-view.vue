<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import { usePostsQuery } from "@/common/composables/usePostsQuery";

  const { data: posts, isPending, isError, error, refetch } = usePostsQuery();
</script>

<template>
  <div class="container mx-auto space-y-4 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">Overview</h1>
      <Button :disabled="isPending" @click="() => refetch()">
        {{ isPending ? "Refreshing..." : "Refresh" }}
      </Button>
    </div>

    <div v-if="isPending" class="py-8 text-center text-muted-foreground">
      Loading...
    </div>

    <div
      v-else-if="isError"
      class="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
    >
      Error: {{ error?.message }}
    </div>

    <ul v-else class="divide-y divide-border rounded-md border bg-card">
      <li
        v-for="post in posts"
        :key="post.id"
        class="p-4 transition hover:bg-muted/50"
      >
        <h3 class="font-medium text-foreground">{{ post.title }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ post.body }}</p>
      </li>
    </ul>
  </div>
</template>
