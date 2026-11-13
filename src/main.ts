import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './common/libs/router.tsx'

createApp(App)
.use(router)
.mount('#app')
