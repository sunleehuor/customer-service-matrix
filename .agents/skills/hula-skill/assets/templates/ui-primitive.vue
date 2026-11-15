<script setup lang="ts">
  import type { HTMLAttributes } from "vue";
  import { cn } from "@/common/libs/utils";

  interface Props {
    class?: HTMLAttributes["class"];
  }

  const props = defineProps<Props>();
</script>

<template>
  <div :class="cn('rounded-md border bg-card p-4 text-card-foreground shadow-xs', props.class)">
    <slot />
  </div>
</template>
