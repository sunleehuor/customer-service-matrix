import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./common/libs/router.tsx";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { i18n } from "./common/libs/i18n.ts";

createApp(App).use(i18n).use(router).use(VueQueryPlugin).mount("#app");
