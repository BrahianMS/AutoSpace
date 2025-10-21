import axios from 'axios'

// Configuración base de axios - Usar variable de entorno o URL directa
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://autospace-backend.onrender.com/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000,
})

// Interceptor mejorado para debug
apiClient.interceptors.request.use(
  config => {
    console.log(`🟡 ${config.method?.toUpperCase()} Request to: ${config.url}`)
    return config
  },
  error => Promise.reject(error)
)

apiClient.interceptors.response.use(
  response => {
    console.log(`🟢 ${response.status} Response from: ${response.config.url}`)
    return response
  },
  error => {
    console.error('🔴 API Error Details:')
    console.error('URL:', error.config?.url)
    console.error('Method:', error.config?.method)
    console.error('Data sent:', error.config?.data)
    console.error('Response:', error.response?.data)
    console.error('Status:', error.response?.status)

    if (error.response?.status === 400) {
      console.error('🟡 Validation Errors:', error.response?.data?.errors)
    }

    return Promise.reject(error)
  }
)

// ==================== DASHBOARD SERVICE ====================
export const dashboardService = {
  obtenerMetricas() {
    return apiClient.get('/dashboard/metrics')
  },

  obtenerIngresosSemanales() {
    return apiClient.get('/dashboard/weekly-income')
  },

  obtenerVehiculosActuales() {
    return apiClient.get('/dashboard/current-vehicles')
  },

  obtenerEstadisticasOperadores() {
    return apiClient.get('/dashboard/operator-stats')
  },

  obtenerVehiculosFrecuentes() {
    return apiClient.get('/dashboard/frequent-vehicles')
  }
}

// ==================== SUBSCRIPTIONS SERVICE ====================
export const subscriptionsService = {
  obtenerTodas() {
    return apiClient.get('/subscriptions')
  },

  obtenerActivas() {
    return apiClient.get('/subscriptions/active')
  },

  obtenerProximasVencer() {
    return apiClient.get('/subscriptions/expiring')
  },

  obtenerPorId(id) {
    return apiClient.get(`/subscriptions/${id}`)
  },

  crear(subscription) {
    const subscriptionData = {
      userId: subscription.userId,
      vehicleId: subscription.vehicleId,
      startDate: new Date(subscription.startDate).toISOString(),
      endDate: new Date(subscription.endDate).toISOString(),
      monthlyPrice: subscription.monthlyPrice
    }

    console.log('🔵 Creando subscripción con datos:', subscriptionData)
    return apiClient.post('/subscriptions', subscriptionData)
  },

  actualizar(id, subscription) {
    const updateData = {
      endDate: new Date(subscription.endDate).toISOString(),
      monthlyPrice: subscription.monthlyPrice,
      status: subscription.status
    }

    console.log('🔵 Actualizando subscripción con datos:', updateData)
    return apiClient.put(`/subscriptions/${id}`, updateData)
  },

  eliminar(id) {
    return apiClient.delete(`/subscriptions/${id}`)
  },

  desactivar(id) {
    return apiClient.post(`/subscriptions/${id}/deactivate`)
  }
}

// ==================== RATES SERVICE ====================
export const ratesService = {
  obtenerTodas() {
    return apiClient.get('/rates')
  },

  obtenerActivas() {
    return apiClient.get('/rates/current')
  },

  obtenerPorId(id) {
    return apiClient.get(`/rates/${id}`)
  },

  crear(rate) {
    const rateData = {
      typeVehicle: rate.typeVehicle,
      hourPrice: rate.hourPrice,
      addPrice: rate.addPrice,
      maxPrice: rate.maxPrice,
      graceTime: rate.graceTime
    }

    console.log('🔵 Creando tarifa con datos:', rateData)
    return apiClient.post('/rates', rateData)
  },

  actualizar(id, rate) {
    const updateData = {
      typeVehicle: rate.typeVehicle,
      hourPrice: rate.hourPrice,
      addPrice: rate.addPrice,
      maxPrice: rate.maxPrice,
      graceTime: rate.graceTime,
      isActive: rate.isActive
    }

    console.log('🔵 Actualizando tarifa con datos:', updateData)
    return apiClient.put(`/rates/${id}`, updateData)
  },

  eliminar(id) {
    return apiClient.delete(`/rates/${id}`)
  }
}

// ==================== OPERATORS SERVICE ====================
export const operatorsService = {
  obtenerTodos() {
    return apiClient.get('/operators')
  },

  obtenerActivos() {
    return apiClient.get('/operators/active')
  },

  obtenerPorId(id) {
    return apiClient.get(`/operators/${id}`)
  },

  crear(operator) {
    const operatorData = {
      fullName: operator.fullName,
      document: operator.document,
      email: operator.email,
      status: operator.status || 'Active'
    }

    console.log('🔵 Creando operador con datos:', operatorData)
    return apiClient.post('/operators', operatorData)
  },

  actualizar(id, operator) {
    const updateData = {
      fullName: operator.fullName,
      document: operator.document,
      email: operator.email,
      status: operator.status,
      isActive: operator.isActive
    }

    console.log('🔵 Actualizando operador con datos:', updateData)
    return apiClient.put(`/operators/${id}`, updateData)
  },

  eliminar(id) {
    return apiClient.delete(`/operators/${id}`)
  },

  activar(id) {
    return this.actualizar(id, { isActive: true })
  },

  desactivar(id) {
    return this.actualizar(id, { isActive: false })
  }
}

// ==================== USERS SERVICE ====================
export const usersService = {
  obtenerTodos() {
    return apiClient.get('/users')
  },

  obtenerPorId(id) {
    return apiClient.get(`/users/${id}`)
  },

  crear(user) {
    const userData = {
      fullName: user.fullName,
      document: user.document,
      email: user.email,
      status: user.status || 'Active'
    }

    console.log('🔵 Creando usuario con datos:', userData)
    return apiClient.post('/users', userData)
  },

  actualizar(id, user) {
    const updateData = {
      fullName: user.fullName,
      document: user.document,
      email: user.email,
      status: user.status
    }

    console.log('🔵 Actualizando usuario con datos:', updateData)
    return apiClient.put(`/users/${id}`, updateData)
  },

  eliminar(id) {
    return apiClient.delete(`/users/${id}`)
  }
}

// ==================== VEHICLES SERVICE ====================
export const vehiclesService = {
  obtenerTodos() {
    return apiClient.get('/vehicles')
  },

  obtenerPorId(id) {
    return apiClient.get(`/vehicles/${id}`)
  },

  crear(vehicle) {
    const vehicleData = {
      plate: vehicle.plate.toUpperCase(),
      type: vehicle.type,
      userId: vehicle.userId
    }

    console.log('🔵 Creando vehículo con datos:', vehicleData)
    return apiClient.post('/vehicles', vehicleData)
  },

  actualizar(id, vehicle) {
    const vehicleData = {
      plate: vehicle.plate?.toUpperCase(),
      type: vehicle.type,
      userId: vehicle.userId
    }

    console.log('🔵 Actualizando vehículo con datos:', vehicleData)
    return apiClient.put(`/vehicles/${id}`, vehicleData)
  },

  eliminar(id) {
    return apiClient.delete(`/vehicles/${id}`)
  }
}

// ==================== TICKETS SERVICE ====================
export const ticketsService = {
  obtenerTodos() {
    return apiClient.get('/tickets')
  },

  obtenerActivos() {
    return apiClient.get('/tickets/active')
  },

  obtenerPorId(id) {
    return apiClient.get(`/tickets/${id}`)
  },

  obtenerActivoPorVehiculo(vehicleId) {
    return apiClient.get(`/tickets/vehicle/${vehicleId}/active`)
  },

  registrarEntrada(ticketData) {
    const entradaData = {
      ticketNumber: this.generarNumeroTicket(),
      vehicleId: ticketData.vehicleId,
      operatorId: ticketData.operatorId,
      subscriptionId: ticketData.subscriptionId,
      rateId: ticketData.rateId
    }

    console.log('🔵 Registrando entrada con datos:', entradaData)
    return apiClient.post('/tickets/entry', entradaData)
  },

  registrarSalida(exitData) {
    const salidaData = {
      ticketId: exitData.ticketId,
      operatorId: exitData.operatorId
    }

    console.log('🔵 Registrando salida con datos:', salidaData)
    return apiClient.post('/tickets/exit', salidaData)
  },

  generarNumeroTicket() {
    return 'TKT' + new Date().toISOString().replace(/[-:.]/g, '').slice(0, 17)
  }
}

// ==================== PAYMENTS SERVICE ====================
export const paymentsService = {
  obtenerTodos() {
    return apiClient.get('/payments')
  },

  crear(payment) {
    const paymentData = {
      ticketId: payment.ticketId,
      subscriptionId: payment.subscriptionId,
      operatorId: payment.operatorId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber
    }

    console.log('🔵 Creando pago con datos:', paymentData)
    return apiClient.post('/payments', paymentData)
  }
}

// ==================== SHIFTS SERVICE ====================
export const shiftsService = {
  obtenerTodos() {
    return apiClient.get('/shifts')
  },

  crear(shift) {
    const shiftData = {
      operatorId: shift.operatorId,
      initialCash: shift.initialCash
    }

    console.log('🔵 Iniciando turno con datos:', shiftData)
    return apiClient.post('/shifts', shiftData)
  },

  cerrar(id, shiftData) {
    const closeData = {
      finalCash: shiftData.finalCash,
      totalCashPayments: shiftData.totalCashPayments,
      totalCardPayments: shiftData.totalCardPayments
    }

    console.log('🔵 Cerrando turno con datos:', closeData)
    return apiClient.put(`/shifts/${id}/close`, closeData)
  }
}

// ==================== MAILS SERVICE ====================
export const mailsService = {
  obtenerTodos() {
    return apiClient.get('/mails')
  },

  crear(mail) {
    const mailData = {
      subject: mail.subject,
      body: mail.body,
      userId: mail.userId,
      subscriptionId: mail.subscriptionId
    }

    console.log('🔵 Creando correo con datos:', mailData)
    return apiClient.post('/mails', mailData)
  }
}

// ==================== HEALTH SERVICE ====================
export const healthService = {
  verificarEstado() {
    return apiClient.get('/health')
  },

  verificarBaseDatos() {
    return apiClient.get('/health/db')
  }
}

// ==================== SERVICIO DE BÚSQUEDA Y UTILIDADES ====================
export const searchService = {
  async buscarVehiculoPorPlaca(placa) {
    const vehiculos = await vehiclesService.obtenerTodos()
    return vehiculos.data.find(v => v.plate.toLowerCase() === placa.toLowerCase())
  },

  async buscarUsuarioPorDocumento(documento) {
    const usuarios = await usersService.obtenerTodos()
    return usuarios.data.find(u => u.document === documento)
  },

  async buscarOperadorPorDocumento(documento) {
    const operadores = await operatorsService.obtenerTodos()
    return operadores.data.find(o => o.document === documento)
  }
}

// ==================== SERVICIO DE REPORTES ====================
export const reportsService = {
  generarReporteDiario(fecha = new Date()) {
    // Puedes expandir esto para generar reportes específicos
    return Promise.all([
      dashboardService.obtenerMetricas(),
      ticketsService.obtenerTodos()
    ])
  },

  async generarReporteMensual(mes, año) {
    const metricas = await dashboardService.obtenerMetricas()
    const tickets = await ticketsService.obtenerTodos()

    return {
      metricas: metricas.data,
      totalTickets: tickets.data.length,
      ticketsPagados: tickets.data.filter(t => t.totalAmount > 0).length,
      ingresosTotales: tickets.data.reduce((sum, t) => sum + (t.totalAmount || 0), 0)
    }
  }
}

// ==================== CONFIGURACIÓN GLOBAL ====================
export const apiConfig = {
  setBaseURL(url) {
    apiClient.defaults.baseURL = url
  },

  setAuthToken(token) {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  },

  setLanguage(lang) {
    apiClient.defaults.headers.common['Accept-Language'] = lang
  }
}

// Exportación por defecto
export default apiClient
