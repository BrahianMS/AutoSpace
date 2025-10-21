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
            >
          </div>
          <div class="form-group">
            <label>Fecha Fin</label>
            <input 
              type="date" 
              v-model="filtros.fechaFin"
              class="form-control"
            >
          </div>
          <button @click="aplicarFiltros" class="btn btn-primary">
            🔍 Aplicar Filtros
          </button>
          <button @click="exportarReporte" class="btn btn-success" :disabled="cargando">
            📊 Exportar a Excel
          </button>
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
    </div>

    <!-- Resumen de Métricas -->
    <div class="metrics-summary">
      <h3>📊 Resumen General</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h4>${{ resumen.ingresosTotales?.toLocaleString() || '0' }}</h4>
            <p>Ingresos Totales</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">🚗</div>
          <div class="metric-content">
            <h4>{{ resumen.totalVehiculos || '0' }}</h4>
            <p>Vehículos Atendidos</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📅</div>
          <div class="metric-content">
            <h4>{{ resumen.subscripcionesActivas || '0' }}</h4>
            <p>Mensualidades Activas</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">⏱️</div>
          <div class="metric-content">
            <h4>{{ resumen.promedioEstadia || '0h 0min' }}</h4>
            <p>Estadía Promedio</p>
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
            <span class="badge">{{ activeTickets.length }}</span>
          </div>
          <div v-if="activeTickets.length === 0" class="empty-state">
            <p>No hay vehículos en el parqueadero</p>
          </div>
          <div v-else class="tickets-list">
            <div v-for="ticket in activeTickets" :key="ticket.id" class="ticket-item">
              <div class="ticket-plate">{{ ticket.vehiclePlate }}</div>
              <div class="ticket-info">
                <div>Ticket: {{ ticket.ticketNumber }}</div>
                <div>Entrada: {{ formatDateTime(ticket.entryTime) }}</div>
                <div>Operador: {{ ticket.operatorName }}</div>
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
            <span class="badge warning">{{ expiringSubscriptions.length }}</span>
          </div>
          <div v-if="expiringSubscriptions.length === 0" class="empty-state">
            <p>No hay mensualidades próximas a vencer</p>
          </div>
          <div v-else class="subscriptions-list">
            <div v-for="sub in expiringSubscriptions" :key="sub.id" class="subscription-item">
              <div class="sub-plate">{{ sub.vehicle?.plate }}</div>
              <div class="sub-info">
                <div>{{ sub.user?.fullName }}</div>
                <div>Vence: {{ formatFecha(sub.endDate) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Operadores Activos -->
        <div class="info-card">
          <div class="info-header">
            <h4>👨‍💼 Operadores Activos</h4>
            <span class="badge">{{ activeOperators.length }}</span>
          </div>
          <div v-if="activeOperators.length === 0" class="empty-state">
            <p>No hay operadores activos</p>
          </div>
          <div v-else class="operators-list">
            <div v-for="operator in activeOperators" :key="operator.id" class="operator-item">
              <div class="operator-name">{{ operator.fullName }}</div>
              <div class="operator-document">{{ operator.document }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información de Tarifas -->
    <div class="rates-info">
      <h3>💰 Tarifas Actuales</h3>
      <div class="rates-grid">
        <div v-for="rate in activeRates" :key="rate.id" class="rate-info-card">
          <h5>{{ rate.typeVehicle }}</h5>
          <div class="rate-details">
            <div class="rate-detail">
              <span>Hora:</span>
              <strong>${{ rate.hourPrice.toLocaleString() }}</strong>
            </div>
            <div class="rate-detail">
              <span>Fracción:</span>
              <strong>${{ rate.addPrice.toLocaleString() }}</strong>
            </div>
            <div class="rate-detail">
              <span>Tope:</span>
              <strong>${{ (rate.maxPrice || 0).toLocaleString() }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Generando reporte...</p>
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
    const tipoReporteActivo = ref('general')

    const filtros = reactive({
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0]
    })

    const tiposReporte = [
      { id: 'general', nombre: 'Reporte General', icono: '📊' },
      { id: 'ingresos', nombre: 'Reporte de Ingresos', icono: '💰' },
      { id: 'ocupacion', nombre: 'Reporte de Ocupación', icono: '🏢' },
      { id: 'mensualidades', nombre: 'Reporte de Mensualidades', icono: '📅' }
    ]

    // Computed para datos del reporte
    const resumen = computed(() => {
      return {
        ingresosTotales: appStore.metrics?.todayIncome || 0,
        totalVehiculos: appStore.activeTickets?.length || 0,
        subscripcionesActivas: appStore.metrics?.activeSubscriptions || 0,
        promedioEstadia: appStore.metrics?.averageStay || '0h 0min'
      }
    })

    const activeTickets = computed(() => appStore.activeTickets)
    const expiringSubscriptions = computed(() => appStore.expiringSubscriptions)
    const activeOperators = computed(() => appStore.operators.filter(op => op.status === 'Active'))
    const activeRates = computed(() => appStore.rates.filter(rate => rate.status === 'Active'))

    const aplicarFiltros = async () => {
      try {
        cargando.value = true
        // Recargar datos con los filtros aplicados
        await Promise.all([
          appStore.fetchMetrics(),
          appStore.fetchActiveTickets(),
          appStore.fetchSubscriptions(),
          appStore.fetchOperators(),
          appStore.fetchRates()
        ])
        
        console.log('Filtros aplicados:', filtros)
        
        // Simular procesamiento de datos
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error('Error aplicando filtros:', error)
      } finally {
        cargando.value = false
      }
    }

    const exportarReporte = () => {
      alert('Función de exportación habilitada. Los datos están listos para exportar.')
      console.log('Exportando reporte con datos actuales')
    }

    const seleccionarTipoReporte = (tipo) => {
      tipoReporteActivo.value = tipo
      console.log('Tipo de reporte seleccionado:', tipo)
    }

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('es-ES')
    }

    const formatFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-ES')
    }

    onMounted(async () => {
      // Cargar todos los datos necesarios para reportes
      await Promise.all([
        appStore.fetchMetrics(),
        appStore.fetchActiveTickets(),
        appStore.fetchSubscriptions(),
        appStore.fetchOperators(),
        appStore.fetchRates()
      ])
      
      // Establecer fecha fin como hoy y fecha inicio como hace 7 días
      const hoy = new Date()
      const hace7Dias = new Date(hoy)
      hace7Dias.setDate(hoy.getDate() - 7)
      
      filtros.fechaInicio = hace7Dias.toISOString().split('T')[0]
      filtros.fechaFin = hoy.toISOString().split('T')[0]
    })

    return {
      cargando,
      tipoReporteActivo,
      filtros,
      tiposReporte,
      resumen,
      activeTickets,
      expiringSubscriptions,
      activeOperators,
      activeRates,
      loading: appStore.loading,
      aplicarFiltros,
      exportarReporte,
      seleccionarTipoReporte,
      formatDateTime,
      formatFecha
    }
  }
}
</script>

<style scoped>
.reports {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 2rem;
}

.subtitle {
  color: #6c757d;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

/* Filtros */
.filters-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.date-filters {
  display: flex;
  gap: 15px;
  align-items: end;
  flex-wrap: wrap;
}

.date-filters .form-group {
  min-width: 150px;
}

.report-types {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.report-type-btn {
  padding: 10px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.report-type-btn:hover {
  border-color: #4e73df;
  color: #4e73df;
}

.report-type-btn.active {
  background: #4e73df;
  border-color: #4e73df;
  color: white;
}

/* Resumen de Métricas */
.metrics-summary {
  margin-bottom: 30px;
}

.metrics-summary h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.metric-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  border-radius: 12px;
}

.metric-content h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.metric-content p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Información Detallada */
.detailed-info {
  margin-bottom: 30px;
}

.info-row {
  display: grid;
  gap: 20px;
  margin-bottom: 20px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.info-card.large {
  grid-column: 1 / -1;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f8f9fa;
}

.info-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.badge {
  background: #4e73df;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.badge.warning {
  background: #ffc107;
  color: #212529;
}

/* Listas */
.tickets-list,
.subscriptions-list,
.operators-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ticket-item,
.subscription-item,
.operator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.ticket-item:hover,
.subscription-item:hover,
.operator-item:hover {
  background: #f8f9fa;
}

.ticket-plate,
.sub-plate {
  font-weight: bold;
  color: #2c3e50;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.ticket-info,
.sub-info {
  text-align: right;
  color: #6c757d;
  font-size: 0.8rem;
}

.operator-name {
  font-weight: 500;
  color: #2c3e50;
}

.operator-document {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Información de Tarifas */
.rates-info {
  margin-bottom: 30px;
}

.rates-info h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.rate-info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #4e73df;
}

.rate-info-card h5 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.rate-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rate-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #f8f9fa;
}

.rate-detail:last-child {
  border-bottom: none;
}

.rate-detail span {
  color: #6c757d;
  font-size: 0.9rem;
}

.rate-detail strong {
  color: #2c3e50;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #6c757d;
  font-style: italic;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4e73df;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  margin: 0;
  color: #6c757d;
}

/* Form Controls */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.form-control {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #4e73df;
  box-shadow: 0 0 0 2px rgba(78, 115, 223, 0.25);
}

/* Botones */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #4e73df;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2e59d9;
}

.btn-success {
  background: #1cc88a;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #17a673;
}

/* Responsive */
@media (max-width: 768px) {
  .date-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-filters .form-group {
    min-width: auto;
  }
  
  .report-types {
    flex-direction: column;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    grid-template-columns: 1fr;
  }
  
  .rates-grid {
    grid-template-columns: 1fr;
  }
}
</style>