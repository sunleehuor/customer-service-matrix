<template>
	<I18nProvider>
		<MatrixClientProvider>
			<slot />
		</MatrixClientProvider>
	</I18nProvider>
</template>
<script setup lang="ts">
import I18nProvider from "./I18nProvider.vue";
import MatrixClientProvider from "./MatrixClientProvider.vue";
</script>
