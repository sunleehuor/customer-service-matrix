import AboutPage from '@/pages/about-page.vue'
import HomePage from '@/pages/home-page.vue'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'

const routes: Readonly<RouteRecordRaw[]> = [
  { path: '/', component: HomePage, name: "Home" },
  { path: '/about', component: AboutPage, name: "About" },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})