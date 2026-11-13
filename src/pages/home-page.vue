<script setup lang="ts">
import api from '@/common/libs/api';
import Button from '@/components/ui/button/Button.vue';
import { useQuery } from '@tanstack/vue-query';

useQuery({
  queryKey: [],
  queryFn: () => api.get("https://jsonplaceholder.typicode.com/posts")
});

</script>

<template>
  <h1 class="text-red-600">Hello</h1>
  <Button>
    Hello
  </Button>
</template>
