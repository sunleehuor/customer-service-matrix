import AboutPage from '@/pages/AboutPage.vue'
import HomePage from '@/pages/HomePage.vue'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'

const routes: Readonly<RouteRecordRaw[]> = [
  { path: '/', component: HomePage, name: "Home" },
  { path: '/about', component: AboutPage, name: "About" },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})