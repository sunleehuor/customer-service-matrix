<template>
  <slot />
</template>

<script setup lang="ts">
  import { onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { LOCALE_KEY } from "../constants/app.constant";
  import { VITE_DEFAULT_LOCALES } from "../libs/env";

  const { locale } = useI18n();

  onMounted(() => {
    const defaultLocale =
      localStorage.getItem(LOCALE_KEY) ?? VITE_DEFAULT_LOCALES;
    localStorage.setItem(LOCALE_KEY, defaultLocale);
    locale.value = defaultLocale;
  });
</script>
