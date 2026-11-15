import AboutPage from "@/pages/AboutPage.vue";
import ChatPage from "@/pages/chats/ChatPage.vue";
import HomePage from "@/pages/HomePage.vue";
import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";

const routes: Readonly<RouteRecordRaw[]> = [
	{ path: "/", component: HomePage, name: "Home" },
	{ path: "/about", component: AboutPage, name: "About" },
	{ path: "/chats/:id", component: ChatPage, name: "Chat" },
];

export const router = createRouter({
	history: createWebHistory(),
	routes,
});
