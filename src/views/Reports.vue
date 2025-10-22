<template>
  <div class="reports">
    <!-- Header -->
    <div class="page-header">
      <h1>📈 Reportes y Análisis - AutoSpace</h1>
      <p class="subtitle">Genera reportes detallados y análisis del parqueadero</p>
    </div>

    <!-- Filtros de Reportes -->
    <div class="filters-card">
      <div class="filter-section">
        <h4>🕐 Rango de Fechas</h4>
        <div class="date-filters">
          <div class="form-group">
            <label>Fecha Inicio</label>
            <input 
              type="date" 
              v-model="filtros.fechaInicio"
              class="form-control"
              :max="filtros.fechaFin"
            >
          </div>
          <div class="form-group">
            <label>Fecha Fin</label>
            <input 
              type="date" 
              v-model="filtros.fechaFin"
              class="form-control"
              :min="filtros.fechaInicio"
              :max="hoy"
            >
          </div>
          <div class="filter-actions">
            <button @click="aplicarFiltros" class="btn btn-primary" :disabled="cargando">
              🔍 Aplicar Filtros
            </button>
            <button @click="limpiarFiltros" class="btn btn-secondary">
              🗑️ Limpiar
            </button>
            <button @click="exportarReporte" class="btn btn-success" :disabled="!datosCargados">
              📊 Exportar Excel
            </button>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <h4>📋 Tipo de Reporte</h4>
        <div class="report-types">
          <button 
            v-for="tipo in tiposReporte" 
            :key="tipo.id"
            @click="seleccionarTipoReporte(tipo.id)"
            :class="['report-type-btn', tipoReporteActivo === tipo.id ? 'active' : '']"
          >
            {{ tipo.icono }} {{ tipo.nombre }}
          </button>
        </div>
      </div>

      <!-- Indicadores de Filtro -->
      <div v-if="filtrosAplicados" class="filter-indicators">
        <span class="filter-tag">
          📅 {{ formatFecha(filtros.fechaInicio) }} - {{ formatFecha(filtros.fechaFin) }}
          <button @click="limpiarFiltros" class="remove-filter">×</button>
        </span>
      </div>
    </div>

    <!-- Estado de Carga y Errores -->
    <div v-if="cargando" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos del reporte...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h4>Error al cargar reportes</h4>
      <p>{{ error }}</p>
      <button @click="cargarDatos" class="btn btn-primary">Reintentar</button>
    </div>

    <div v-else-if="!datosCargados" class="empty-state">
      <div class="empty-icon">📊</div>
      <h4>No hay datos para mostrar</h4>
      <p>Selecciona un rango de fechas y aplica los filtros</p>
      <button @click="cargarDatosPorDefecto" class="btn btn-primary">
        Cargar Datos de Hoy
      </button>
    </div>

    <!-- Contenido Principal del Reporte -->
    <div v-else class="report-content">
      <!-- Resumen de Métricas -->
      <div class="metrics-summary">
        <h3>📊 Resumen General</h3>
        <div class="metrics-grid">
          <div class="metric-card" v-for="metric in metricasResumen" :key="metric.id">
            <div class="metric-icon">{{ metric.icono }}</div>
            <div class="metric-content">
              <h4>{{ metric.valor }}</h4>
              <p>{{ metric.nombre }}</p>
              <small v-if="metric.variacion" :class="metric.variacionClase">
                {{ metric.variacion }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Información Detallada -->
      <div class="detailed-info">
        <div class="info-row">
          <!-- Vehículos Activos -->
          <div class="info-card large">
            <div class="info-header">
              <h4>🚗 Vehículos Actualmente en Parqueadero</h4>
              <span class="badge">{{ ticketsActivos.length }}</span>
            </div>
            <div v-if="ticketsActivos.length === 0" class="empty-state-small">
              <p>No hay vehículos en el parqueadero</p>
            </div>
            <div v-else class="tickets-list">
              <div v-for="ticket in ticketsActivos" :key="ticket.id" class="ticket-item">
                <div class="ticket-plate">{{ ticket.vehicle?.plate || 'N/A' }}</div>
                <div class="ticket-info">
                  <div><strong>Ticket:</strong> {{ ticket.ticketNumber }}</div>
                  <div><strong>Entrada:</strong> {{ formatDateTime(ticket.entryTime) }}</div>
                  <div><strong>Operador:</strong> {{ ticket.operator?.fullName || 'N/A' }}</div>
                  <div><strong>Tipo:</strong> {{ ticket.vehicle?.type || 'N/A' }}</div>
                </div>
                <div class="ticket-duration">
                  <span class="duration-badge">
                    {{ calcularDuracionActual(ticket.entryTime) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-row">
          <!-- Mensualidades Próximas a Vencer -->
          <div class="info-card">
            <div class="info-header">
              <h4>📅 Mensualidades Próximas a Vencer</h4>
              <span class="badge warning">{{ suscripcionesProximas.length }}</span>
            </div>
            <div v-if="suscripcionesProximas.length === 0" class="empty-state-small">
              <p>No hay mensualidades próximas a vencer</p>
            </div>
            <div v-else class="subscriptions-list">
              <div v-for="sub in suscripcionesProximas" :key="sub.id" class="subscription-item">
                <div class="sub-header">
                  <div class="sub-plate">{{ sub.vehiclePlate }}</div>
                  <div class="sub-days" :class="getDiasVencimientoClase(sub.endDate)">
                    {{ calcularDiasHastaVencimiento(sub.endDate) }} días
                  </div>
                </div>
                <div class="sub-info">
                  <div><strong>Usuario:</strong> {{ sub.userFullName }}</div>
                  <div><strong>Vence:</strong> {{ formatFecha(sub.endDate) }}</div>
                  <div><strong>Precio:</strong> ${{ sub.monthlyPrice?.toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Operadores Activos -->
          <div class="info-card">
            <div class="info-header">
              <h4>👨‍💼 Operadores Activos</h4>
              <span class="badge">{{ operadoresActivos.length }}</span>
            </div>
            <div v-if="operadoresActivos.length === 0" class="empty-state-small">
              <p>No hay operadores activos</p>
            </div>
            <div v-else class="operators-list">
              <div v-for="operator in operadoresActivos" :key="operator.id" class="operator-item">
                <div class="operator-avatar">
                  {{ getIniciales(operator.fullName) }}
                </div>
                <div class="operator-details">
                  <div class="operator-name">{{ operator.fullName }}</div>
                  <div class="operator-stats">
                    <span class="stat">{{ operator.ticketsProcessed || 0 }} tickets</span>
                    <span class="stat">${{ (operator.totalCollected || 0).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reporte de Ingresos -->
      <div v-if="tipoReporteActivo === 'ingresos'" class="revenue-section">
        <h3>💰 Reporte de Ingresos</h3>
        <div class="revenue-grid">
          <div class="revenue-card">
            <h5>Ingresos por Tipo</h5>
            <div class="revenue-list">
              <div v-for="ingreso in ingresosPorTipo" :key="ingreso.tipo" class="revenue-item">
                <span class="revenue-type">{{ ingreso.tipo }}</span>
                <span class="revenue-amount">${{ ingreso.monto.toLocaleString() }}</span>
                <div class="revenue-bar">
                  <div 
                    class="revenue-fill" 
                    :style="{ width: ingreso.porcentaje + '%' }"
                  ></div>
                </div>
                <span class="revenue-percent">{{ ingreso.porcentaje }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de Tarifas -->
      <div class="rates-info">
        <h3>💰 Tarifas Actuales</h3>
        <div class="rates-grid">
          <div v-for="rate in tarifasActivas" :key="rate.id" class="rate-info-card">
            <h5>{{ getTipoVehiculoTexto(rate.typeVehicle) }}</h5>
            <div class="rate-details">
              <div class="rate-detail">
                <span>Hora:</span>
                <strong>${{ rate.hourPrice?.toLocaleString() || '0' }}</strong>
              </div>
              <div class="rate-detail">
                <span>Fracción:</span>
                <strong>${{ rate.addPrice?.toLocaleString() || '0' }}</strong>
              </div>
              <div class="rate-detail">
                <span>Tope:</span>
                <strong>${{ (rate.maxPrice || 0).toLocaleString() }}</strong>
              </div>
              <div class="rate-detail">
                <span>Tiempo Gracia:</span>
                <strong>{{ rate.graceTime || 0 }} min</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import { useAppStore } from '@/stores/app'

export default {
  name: 'Reports',
  setup() {
    const appStore = useAppStore()
    const cargando = ref(false)
    const error = ref(null)
    const tipoReporteActivo = ref('general')
    const datosCargados = ref(false)

    const hoy = new Date().toISOString().split('T')[0]
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)
    const fechaHace7Dias = hace7Dias.toISOString().split('T')[0]

    const filtros = reactive({
      fechaInicio: fechaHace7Dias,
      fechaFin: hoy
    })

    const tiposReporte = [
      { id: 'general', nombre: 'Reporte General', icono: '📊' },
      { id: 'ingresos', nombre: 'Reporte de Ingresos', icono: '💰' },
      { id: 'ocupacion', nombre: 'Reporte de Ocupación', icono: '🏢' },
      { id: 'mensualidades', nombre: 'Reporte de Mensualidades', icono: '📅' }
    ]

    // Computed properties corregidas
    const filtrosAplicados = computed(() => {
      return filtros.fechaInicio !== fechaHace7Dias || filtros.fechaFin !== hoy
    })

    const metricasResumen = computed(() => {
      const tickets = appStore.tickets || []
      const suscripciones = appStore.subscriptions || []
      const pagos = appStore.payments || []
      
      const ingresosTotales = pagos.reduce((sum, p) => sum + (p.amount || 0), 0)
      const vehiculosAtendidos = new Set(tickets.map(t => t.vehicleId)).size
      const suscripcionesActivas = suscripciones.filter(s => s.status === 'Active').length
      
      // Calcular estadía promedio
      const ticketsCompletados = tickets.filter(t => t.exitTime)
      const promedioEstadia = ticketsCompletados.length > 0 
        ? calcularPromedioEstadia(ticketsCompletados)
        : '0h 0min'

      return [
        {
          id: 'ingresos',
          nombre: 'Ingresos Totales',
          icono: '💰',
          valor: `$${ingresosTotales.toLocaleString()}`,
          variacion: '+12% vs periodo anterior',
          variacionClase: 'positive'
        },
        {
          id: 'vehiculos',
          nombre: 'Vehículos Atendidos',
          icono: '🚗',
          valor: vehiculosAtendidos.toLocaleString(),
          variacion: '+5% vs periodo anterior',
          variacionClase: 'positive'
        },
        {
          id: 'suscripciones',
          nombre: 'Mensualidades Activas',
          icono: '📅',
          valor: suscripcionesActivas.toLocaleString(),
          variacion: '+2 nuevas',
          variacionClase: 'positive'
        },
        {
          id: 'estadia',
          nombre: 'Estadía Promedio',
          icono: '⏱️',
          valor: promedioEstadia,
          variacion: '-15min vs promedio',
          variacionClase: 'negative'
        }
      ]
    })

    const ticketsActivos = computed(() => {
      return (appStore.activeTickets || []).map(ticket => ({
        ...ticket,
        vehicle: appStore.vehicles?.find(v => v.id === ticket.vehicleId) || {},
        operator: appStore.operators?.find(o => o.id === ticket.operatorId) || {}
      }))
    })

    const suscripcionesProximas = computed(() => {
      const suscripciones = appStore.subscriptions || []
      const hoy = new Date()
      const en7Dias = new Date()
      en7Dias.setDate(hoy.getDate() + 7)
      
      return suscripciones.filter(sub => {
        if (sub.status !== 'Active') return false
        const fechaFin = new Date(sub.endDate)
        return fechaFin <= en7Dias && fechaFin >= hoy
      })
    })

    const operadoresActivos = computed(() => {
      return (appStore.operators || []).filter(op => op.isActive)
    })

    const tarifasActivas = computed(() => {
      return (appStore.rates || []).filter(rate => rate.isActive)
    })

    const ingresosPorTipo = computed(() => {
      // Simular datos de ingresos por tipo
      return [
        { tipo: 'Tickets Diarios', monto: 450000, porcentaje: 45 },
        { tipo: 'Mensualidades', monto: 350000, porcentaje: 35 },
        { tipo: 'Servicios Extra', monto: 120000, porcentaje: 12 },
        { tipo: 'Multas', monto: 80000, porcentaje: 8 }
      ]
    })

    // Métodos
    const cargarDatos = async () => {
      try {
        cargando.value = true
        error.value = null
        
        await Promise.all([
          appStore.fetchTickets(),
          appStore.fetchSubscriptions(),
          appStore.fetchOperators(),
          appStore.fetchVehicles(),
          appStore.fetchRates(),
          appStore.fetchPayments()
        ])
        
        datosCargados.value = true
      } catch (err) {
        error.value = err.message || 'Error al cargar los datos del reporte'
        console.error('Error cargando reportes:', err)
      } finally {
        cargando.value = false
      }
    }

    const cargarDatosPorDefecto = async () => {
      // Cargar datos del día actual
      const hoy = new Date()
      filtros.fechaInicio = hoy.toISOString().split('T')[0]
      filtros.fechaFin = hoy.toISOString().split('T')[0]
      await aplicarFiltros()
    }

    const aplicarFiltros = async () => {
      try {
        cargando.value = true
        console.log('Aplicando filtros:', filtros)
        
        // Aquí iría la lógica real de filtrado con el backend
        // Por ahora recargamos todos los datos
        await cargarDatos()
        
      } catch (err) {
        error.value = 'Error al aplicar filtros: ' + err.message
      } finally {
        cargando.value = false
      }
    }

    const limpiarFiltros = () => {
      filtros.fechaInicio = fechaHace7Dias
      filtros.fechaFin = hoy
      aplicarFiltros()
    }

    const exportarReporte = () => {
      // Implementación básica de exportación
      const datosExportar = {
        fechaGeneracion: new Date().toISOString(),
        rangoFechas: `${filtros.fechaInicio} a ${filtros.fechaFin}`,
        metricas: metricasResumen.value,
        ticketsActivos: ticketsActivos.value,
        suscripcionesProximas: suscripcionesProximas.value
      }
      
      const blob = new Blob([JSON.stringify(datosExportar, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-autospace-${filtros.fechaInicio}-${filtros.fechaFin}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      alert('Reporte exportado correctamente')
    }

    const seleccionarTipoReporte = (tipo) => {
      tipoReporteActivo.value = tipo
    }

    // Funciones utilitarias
    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('es-ES')
    }

    const formatFecha = (fecha) => {
      if (!fecha) return 'N/A'
      return new Date(fecha).toLocaleDateString('es-ES')
    }

    const calcularDuracionActual = (entryTime) => {
      if (!entryTime) return 'N/A'
      const entrada = new Date(entryTime)
      const ahora = new Date()
      const diffMs = ahora - entrada
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${diffHoras}h ${diffMinutos}m`
    }

    const calcularDiasHastaVencimiento = (endDate) => {
      const fin = new Date(endDate)
      const hoy = new Date()
      const diffTime = fin - hoy
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const getDiasVencimientoClase = (endDate) => {
      const dias = calcularDiasHastaVencimiento(endDate)
      if (dias <= 2) return 'urgent'
      if (dias <= 5) return 'warning'
      return 'normal'
    }

    const calcularPromedioEstadia = (tickets) => {
      const totalMs = tickets.reduce((sum, ticket) => {
        const entrada = new Date(ticket.entryTime)
        const salida = new Date(ticket.exitTime)
        return sum + (salida - entrada)
      }, 0)
      
      const promedioMs = totalMs / tickets.length
      const horas = Math.floor(promedioMs / (1000 * 60 * 60))
      const minutos = Math.floor((promedioMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${horas}h ${minutos}m`
    }

    const getIniciales = (nombre) => {
      return nombre.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getTipoVehiculoTexto = (tipo) => {
      const tipos = {
        'Car': 'Automóvil',
        'Motorcycle': 'Motocicleta',
        'Truck': 'Camión'
      }
      return tipos[tipo] || tipo
    }

    onMounted(() => {
      cargarDatosPorDefecto()
    })

    return {
      cargando,
      error,
      tipoReporteActivo,
      datosCargados,
      filtros,
      filtrosAplicados,
      tiposReporte,
      hoy,
      metricasResumen,
      ticketsActivos,
      suscripcionesProximas,
      operadoresActivos,
      tarifasActivas,
      ingresosPorTipo,
      aplicarFiltros,
      limpiarFiltros,
      exportarReporte,
      seleccionarTipoReporte,
      cargarDatos,
      cargarDatosPorDefecto,
      formatDateTime,
      formatFecha,
      calcularDuracionActual,
      calcularDiasHastaVencimiento,
      getDiasVencimientoClase,
      getIniciales,
      getTipoVehiculoTexto
    }
  }
}
</script>

<style scoped>
/* Mantén todos tus estilos existentes y agrega estos nuevos */

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-indicators {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.filter-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-filter {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.remove-filter:hover {
  color: #ff4444;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.error-state h4,
.empty-state h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.error-state p,
.empty-state p {
  color: #6c757d;
  margin-bottom: 20px;
}

/* Estados pequeños para listas vacías */
.empty-state-small {
  text-align: center;
  padding: 30px 20px;
  color: #6c757d;
  font-style: italic;
}

/* Mejoras en las listas */
.ticket-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 15px;
  align-items: center;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 8px;
}

.ticket-info {
  display: grid;
  gap: 4px;
}

.ticket-info div {
  font-size: 0.85rem;
  color: #6c757d;
}

.duration-badge {
  background: #fff3cd;
  color: #856404;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sub-days {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
}

.sub-days.urgent { background: #f8d7da; color: #721c24; }
.sub-days.warning { background: #fff3cd; color: #856404; }
.sub-days.normal { background: #d4edda; color: #155724; }

.operator-avatar {
  width: 40px;
  height: 40px;
  background: #4e73df;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.operator-details {
  flex: 1;
}

.operator-stats {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.operator-stats .stat {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #6c757d;
}

/* Sección de ingresos */
.revenue-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.revenue-grid {
  display: grid;
  gap: 20px;
}

.revenue-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.revenue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.revenue-item {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 15px;
  align-items: center;
  padding: 8px 0;
}

.revenue-type {
  font-weight: 500;
  color: #2c3e50;
}

.revenue-amount {
  font-weight: bold;
  color: #2c3e50;
}

.revenue-bar {
  width: 100px;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.revenue-fill {
  height: 100%;
  background: #4e73df;
  transition: width 0.3s ease;
}

.revenue-percent {
  color: #6c757d;
  font-size: 0.9rem;
  min-width: 40px;
  text-align: right;
}

/* Variaciones en métricas */
.metric-content small {
  display: block;
  margin-top: 4px;
  font-size: 0.8rem;
}

.metric-content small.positive {
  color: #28a745;
}

.metric-content small.negative {
  color: #dc3545;
}

/* Responsive */
@media (max-width: 768px) {
  .date-filters {
    flex-direction: column;
  }
  
  .filter-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-actions .btn {
    width: 100%;
  }
  
  .ticket-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .revenue-item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: center;
  }
  
  .revenue-bar {
    width: 100%;
  }
}
</style>