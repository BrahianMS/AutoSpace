import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Operators from '@/views/Operators.vue'
import Rates from '@/views/Rates.vue'
import Subscriptions from '@/views/Subscriptions.vue'
import Users from '@/views/Users.vue'
import Reports from '@/views/Reports.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/operators', name: 'Operators', component: Operators },
  { path: '/rates', name: 'Rates', component: Rates },
  { path: '/subscriptions', name: 'Subscriptions', component: Subscriptions },
  { path: '/users', name: 'Users', component: Users },
  { path: '/reports', name: 'Reports', component: Reports }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
