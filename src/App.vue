<script setup lang="ts">
  import I18nProvider from "./common/providers/I18nProvider.vue";
</script>

<template>
  <I18nProvider>
    <main>
      <RouterView />
    </main>
  </I18nProvider>
</template>
