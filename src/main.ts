import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import DisableDevtool from 'disable-devtool'
import './assets/index.css'

// Chỉ kích hoạt chống Inspect / Console trên môi trường Production
if (import.meta.env.PROD) {
  DisableDevtool({
    clearLog: true,     // Tự động xóa Console
    disableMenu: true,  // Chặn menu chuột phải
  })
}

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')