// stores/app.js
import { defineStore } from 'pinia'
import {
  dashboardService,
  operatorsService,
  ratesService,
  subscriptionsService,
  usersService,
  vehiclesService,
  ticketsService
} from '@/services/api'

export const useAppStore = defineStore('app', {
  state: () => ({
    // Estado para cada módulo
    metrics: null,
    operators: [],
    rates: [],
    subscriptions: [],
    users: [],
    vehicles: [],
    activeTickets: [],
    currentVehicles: [],
    weeklyIncome: [],
    loading: false,
    error: null
  }),

  actions: {
    // ========== DASHBOARD ==========
    async fetchMetrics() {
      try {
        this.loading = true
        const response = await dashboardService.obtenerMetricas()
        this.metrics = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando métricas'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentVehicles() {
      try {
        const response = await dashboardService.obtenerVehiculosActuales()
        this.currentVehicles = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando vehículos actuales'
        throw error
      }
    },

    async fetchWeeklyIncome() {
      try {
        const response = await dashboardService.obtenerIngresosSemanales()
        this.weeklyIncome = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando ingresos semanales'
        throw error
      }
    },

    // ========== USUARIOS ==========
    async fetchUsers() {
      try {
        this.loading = true
        const response = await usersService.obtenerTodos()
        this.users = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando usuarios'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(userData) {
      try {
        this.loading = true
        const response = await usersService.crear(userData)
        this.users.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error creando usuario'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUser(id, userData) {
      try {
        this.loading = true
        const response = await usersService.actualizar(id, userData)
        const index = this.users.findIndex(user => user.id === id)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...response.data }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error actualizando usuario'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id) {
      try {
        this.loading = true
        await usersService.eliminar(id)
        this.users = this.users.filter(user => user.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Error eliminando usuario'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== VEHÍCULOS ==========
    async fetchVehicles() {
      try {
        this.loading = true
        const response = await vehiclesService.obtenerTodos()
        this.vehicles = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando vehículos'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createVehicle(vehicleData) {
      try {
        this.loading = true
        const response = await vehiclesService.crear(vehicleData)
        this.vehicles.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error creando vehículo'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateVehicle(id, vehicleData) {
      try {
        this.loading = true
        const response = await vehiclesService.actualizar(id, vehicleData)
        const index = this.vehicles.findIndex(vehicle => vehicle.id === id)
        if (index !== -1) {
          this.vehicles[index] = { ...this.vehicles[index], ...response.data }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error actualizando vehículo'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteVehicle(id) {
      try {
        this.loading = true
        await vehiclesService.eliminar(id)
        this.vehicles = this.vehicles.filter(vehicle => vehicle.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Error eliminando vehículo'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== OPERADORES ==========
    async fetchOperators() {
      try {
        this.loading = true
        const response = await operatorsService.obtenerTodos()
        this.operators = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando operadores'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createOperator(operatorData) {
      try {
        this.loading = true
        const response = await operatorsService.crear(operatorData)
        this.operators.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error creando operador'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateOperator(id, operatorData) {
      try {
        this.loading = true
        const response = await operatorsService.actualizar(id, operatorData)
        const index = this.operators.findIndex(op => op.id === id)
        if (index !== -1) {
          this.operators[index] = { ...this.operators[index], ...response.data }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error actualizando operador'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteOperator(id) {
      try {
        this.loading = true
        await operatorsService.eliminar(id)
        this.operators = this.operators.filter(op => op.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Error eliminando operador'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== TARIFAS ==========
    async fetchRates() {
      try {
        this.loading = true
        const response = await ratesService.obtenerTodas()
        // Convertir isActive a status para compatibilidad con las vistas
        this.rates = response.data.map(rate => ({
          ...rate,
          status: rate.isActive ? 'Active' : 'Inactive'
        }))
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando tarifas'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createRate(rateData) {
      try {
        this.loading = true
        // Convertir status a isActive para el backend
        const dataToSend = {
          ...rateData,
          isActive: rateData.status === 'Active'
        }
        const response = await ratesService.crear(dataToSend)
        // Convertir respuesta para compatibilidad con vistas
        const rateWithStatus = {
          ...response.data,
          status: response.data.isActive ? 'Active' : 'Inactive'
        }
        this.rates.push(rateWithStatus)
        return rateWithStatus
      } catch (error) {
        this.error = error.response?.data?.error || 'Error creando tarifa'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateRate(id, rateData) {
      try {
        this.loading = true
        // Convertir status a isActive para el backend
        const dataToSend = {
          ...rateData,
          isActive: rateData.status === 'Active'
        }
        const response = await ratesService.actualizar(id, dataToSend)
        // Convertir respuesta para compatibilidad con vistas
        const rateWithStatus = {
          ...response.data,
          status: response.data.isActive ? 'Active' : 'Inactive'
        }
        const index = this.rates.findIndex(rate => rate.id === id)
        if (index !== -1) {
          this.rates[index] = rateWithStatus
        }
        return rateWithStatus
      } catch (error) {
        this.error = error.response?.data?.error || 'Error actualizando tarifa'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteRate(id) {
      try {
        this.loading = true
        await ratesService.eliminar(id)
        this.rates = this.rates.filter(rate => rate.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Error eliminando tarifa'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== SUSCRIPCIONES ==========
    async fetchSubscriptions() {
      try {
        this.loading = true
        const response = await subscriptionsService.obtenerTodas()
        this.subscriptions = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando suscripciones'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createSubscription(subscriptionData) {
      try {
        this.loading = true
        const response = await subscriptionsService.crear(subscriptionData)
        this.subscriptions.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error creando suscripción'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateSubscription(id, subscriptionData) {
      try {
        this.loading = true
        const response = await subscriptionsService.actualizar(id, subscriptionData)
        const index = this.subscriptions.findIndex(sub => sub.id === id)
        if (index !== -1) {
          this.subscriptions[index] = { ...this.subscriptions[index], ...response.data }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error actualizando suscripción'
        throw error
      } finally {
        this.loading = false
      }
    },

    async inactivateSubscription(id) {
      try {
        this.loading = true
        const response = await subscriptionsService.desactivar(id)
        const index = this.subscriptions.findIndex(sub => sub.id === id)
        if (index !== -1) {
          this.subscriptions[index] = { ...this.subscriptions[index], ...response.data }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error inactivando suscripción'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteSubscription(id) {
      try {
        this.loading = true
        await subscriptionsService.eliminar(id)
        this.subscriptions = this.subscriptions.filter(sub => sub.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || 'Error eliminando suscripción'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== TICKETS ==========
    async fetchActiveTickets() {
      try {
        this.loading = true
        const response = await ticketsService.obtenerActivos()
        this.activeTickets = response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cargando tickets activos'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTicket(ticketData) {
      try {
        this.loading = true
        const response = await ticketsService.registrarEntrada(ticketData)
        this.activeTickets.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error creando ticket'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTicket(id, ticketData) {
      try {
        this.loading = true
        const response = await ticketsService.actualizar(id, ticketData)
        const index = this.activeTickets.findIndex(ticket => ticket.id === id)
        if (index !== -1) {
          this.activeTickets[index] = { ...this.activeTickets[index], ...response.data }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error actualizando ticket'
        throw error
      } finally {
        this.loading = false
      }
    },

    async closeTicket(id, paymentData) {
      try {
        this.loading = true
        const response = await ticketsService.registrarSalida({ ticketId: id, ...paymentData })
        this.activeTickets = this.activeTickets.filter(ticket => ticket.id !== id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || 'Error cerrando ticket'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ========== UTILIDADES ==========
    async loadAllData() {
      try {
        this.loading = true
        await Promise.all([
          this.fetchMetrics(),
          this.fetchUsers(),
          this.fetchVehicles(),
          this.fetchOperators(),
          this.fetchRates(),
          this.fetchSubscriptions(),
          this.fetchActiveTickets()
        ])
      } catch (error) {
        this.error = 'Error cargando datos iniciales'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    // ========== GETTERS PARA DATOS FILTRADOS ==========
    activeOperators: (state) => state.operators.filter(op => op.status === 'Active'),
    
    activeRates: (state) => state.rates.filter(rate => rate.status === 'Active'),
    
    activeSubscriptions: (state) => state.subscriptions.filter(sub => sub.status === 'Active'),
    
    expiringSubscriptions: (state) => {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      return state.subscriptions.filter(sub => {
        if (sub.status !== 'Active') return false
        
        const endDate = new Date(sub.endDate)
        return endDate <= nextWeek && endDate >= today
      })
    },

    // ========== GETTERS PARA ESTADÍSTICAS ==========
    usersStats: (state) => {
      const total = state.users.length
      const active = state.users.filter(user => user.status === 'Active').length
      const withVehicles = state.users.filter(user => 
        state.vehicles.some(vehicle => vehicle.userId === user.id)
      ).length
      const withSubscriptions = state.users.filter(user =>
        state.subscriptions.some(sub => sub.userId === user.id && sub.status === 'Active')
      ).length

      return { total, active, withVehicles, withSubscriptions }
    },

    operatorsStats: (state) => {
      const total = state.operators.length
      const active = state.operators.filter(op => op.status === 'Active').length
      const totalCollected = state.operators.reduce((sum, op) => sum + (op.totalCollected || 0), 0)

      return { total, active, totalCollected }
    },

    // ========== GETTERS PARA BÚSQUEDAS ==========
    getUserById: (state) => (id) => {
      return state.users.find(user => user.id === id)
    },

    getVehicleById: (state) => (id) => {
      return state.vehicles.find(vehicle => vehicle.id === id)
    },

    getOperatorById: (state) => (id) => {
      return state.operators.find(operator => operator.id === id)
    },

    getSubscriptionById: (state) => (id) => {
      return state.subscriptions.find(subscription => subscription.id === id)
    },

    // ========== GETTERS PARA RELACIONES ==========
    getUserVehicles: (state) => (userId) => {
      return state.vehicles.filter(vehicle => vehicle.userId === userId)
    },

    getUserSubscriptions: (state) => (userId) => {
      return state.subscriptions.filter(sub => sub.userId === userId)
    },

    getVehicleSubscriptions: (state) => (vehicleId) => {
      return state.subscriptions.filter(sub => sub.vehicleId === vehicleId)
    }
  }
})