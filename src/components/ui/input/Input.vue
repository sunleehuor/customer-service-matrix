<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/common/libs/utils";

interface Props {
	defaultValue?: string | number;
	modelValue?: string | number;
	class?: HTMLAttributes["class"];
	placeholder?: string;
	disabled?: boolean;
	type?: string;
}

const props = withDefaults(defineProps<Props>(), {
	type: "text",
});

const modelValue = defineModel<string | number>();
</script>

<template>
	<input
		v-model="modelValue"
		data-slot="input"
		:type="props.type"
		:disabled="props.disabled"
		:placeholder="props.placeholder"
		:class="
			cn(
				'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				props.class,
			)
		"
	/>
</template>
