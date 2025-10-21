import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Importar Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.css'

const app = createApp(App)
const pinia = createPinia()

// Usar plugins
app.use(pinia)
app.use(router)

// Montar la aplicación
app.mount('#app')