<template>
	<slot />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { initialize, stop } from "../libs/matrix/matrix";
import { VITE_HOME_SERVER } from "../libs/env";

onMounted(() => {
	initialize({
		accessToken: "syt_bGVlbWFvazAx_IwbxWyVeoReVVdTiKPiP_4FM909",
		baseUrl: VITE_HOME_SERVER,
		deviceId: "LWRGZBEITZ",
		userId: "@leemaok01:matrix.vai247.pro",
	});
});

onBeforeUnmount(() => {
	stop();
});
</script>
