<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>📊 Dashboard AutoSpace</h1>
      <div class="header-actions">
        <button @click="loadData" class="btn btn-sm btn-outline-secondary" :disabled="loading">
          🔄 Actualizar
        </button>
        <span class="last-update">Última actualización: {{ lastUpdate }}</span>
      </div>
    </div>

    <!-- Métricas principales -->
    <div class="metrics-grid">
      <!-- Vehículos Totales -->
      <div class="metric-card">
        <div class="metric-icon vehicle">🚗</div>
        <div class="metric-content">
          <h3>{{ metrics?.totalVehicles || 0 }}</h3>
          <p>Vehículos Totales</p>
          <small>Registrados en el sistema</small>
        </div>
      </div>

      <!-- Ingresos del Día -->
      <div class="metric-card">
        <div class="metric-icon income">💰</div>
        <div class="metric-content">
          <h3>${{ (metrics?.dailyIncome || 0).toLocaleString() }}</h3>
          <p>Ingresos Hoy</p>
          <small>Semanal: ${{ (metrics?.weeklyIncome || 0).toLocaleString() }}</small>
        </div>
      </div>

      <!-- Subscripciones Activas -->
      <div class="metric-card">
        <div class="metric-icon subscription">📅</div>
        <div class="metric-content">
          <h3>{{ metrics?.activeSubscriptions || 0 }}</h3>
          <p>Mensualidades Activas</p>
          <small>{{ metrics?.expiringSubscriptions || 0 }} próximas a vencer</small>
        </div>
      </div>

      <!-- Operadores Activos -->
      <div class="metric-card">
        <div class="metric-icon operator">👨‍💼</div>
        <div class="metric-content">
          <h3>{{ metrics?.activeOperators || 0 }}</h3>
          <p>Operadores Activos</p>
          <small>Tickets activos: {{ metrics?.activeTickets || 0 }}</small>
        </div>
      </div>
    </div>

    <!-- Vehículos Activos -->
    <div class="section">
      <div class="section-header">
        <h3>🚗 Vehículos Actualmente en el Parqueadero</h3>
        <span class="badge">{{ currentVehicles.length }}</span>
      </div>
      <div v-if="currentVehicles.length === 0" class="empty-state">
        <p>No hay vehículos en el parqueadero</p>
      </div>
      <div v-else class="tickets-grid">
        <div v-for="vehicle in currentVehicles" :key="vehicle.ticketId" class="ticket-card">
          <div class="ticket-header">
            <span class="ticket-plate">{{ vehicle.licensePlate }}</span>
            <span class="vehicle-type">{{ vehicle.vehicleType }}</span>
          </div>
          <div class="ticket-info">
            <div class="info-item">
              <span class="label">Entrada:</span>
              <span class="value">{{ formatDateTime(vehicle.entryTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Tiempo:</span>
              <span class="value">{{ formatDuration(vehicle.duration) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Operador:</span>
              <span class="value">{{ vehicle.operatorName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ingresos Semanales -->
    <div class="section">
      <div class="section-header">
        <h3>📈 Ingresos de la Semana</h3>
      </div>
      <div class="weekly-income">
        <div v-for="day in weeklyIncome" :key="day.day" class="income-day">
          <div class="day-name">{{ day.day }}</div>
          <div class="income-bar-container">
            <div
              class="income-bar"
              :style="{ height: calculateBarHeight(day.income) + '%' }"
              :title="`$${day.income.toLocaleString()} - ${day.ticketCount} tickets`"
            ></div>
          </div>
          <div class="income-amount">${{ day.income.toLocaleString() }}</div>
          <div class="ticket-count">{{ day.ticketCount }} tickets</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando datos del dashboard...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-alert">
      <span>Error: {{ error }}</span>
      <button @click="clearError" class="close-error">×</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { dashboardService } from '@/services/api'

export default {
  name: 'Dashboard',
  setup() {
    const metrics = ref({})
    const currentVehicles = ref([])
    const weeklyIncome = ref([])
    const loading = ref(false)
    const error = ref('')
    const refreshInterval = ref(null)
    const lastUpdate = ref('')

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('es-ES')
    }

    const formatDuration = (duration) => {
      if (!duration) return '0h 0min'

      const hours = Math.floor(duration.hours || 0)
      const minutes = Math.floor((duration.minutes || 0) % 60)
      return `${hours}h ${minutes}min`
    }

    const calculateBarHeight = (income) => {
      const maxIncome = Math.max(...weeklyIncome.value.map(day => day.income))
      if (maxIncome === 0) return 0
      return (income / maxIncome) * 100
    }

    const loadData = async () => {
      try {
        loading.value = true
        error.value = ''

        const [metricsResponse, vehiclesResponse, incomeResponse] = await Promise.all([
          dashboardService.obtenerMetricas(),
          dashboardService.obtenerVehiculosActuales(),
          dashboardService.obtenerIngresosSemanales()
        ])

        metrics.value = metricsResponse.data
        currentVehicles.value = vehiclesResponse.data
        weeklyIncome.value = incomeResponse.data

        lastUpdate.value = new Date().toLocaleTimeString('es-ES')
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        error.value = err.response?.data?.error || 'Error cargando datos del dashboard'
      } finally {
        loading.value = false
      }
    }

    const clearError = () => {
      error.value = ''
    }

    onMounted(async () => {
      await loadData()
      // Refresh data every 30 seconds
      refreshInterval.value = setInterval(loadData, 30000)
    })

    onUnmounted(() => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
      }
    })

    return {
      metrics,
      currentVehicles,
      weeklyIncome,
      loading,
      error,
      lastUpdate,
      loadData,
      clearError,
      formatDateTime,
      formatDuration,
      calculateBarHeight
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.last-update {
  color: #6c757d;
  font-size: 0.9rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.metric-icon.vehicle { background: #e3f2fd; }
.metric-icon.income { background: #e8f5e8; }
.metric-icon.subscription { background: #fff3cd; }
.metric-icon.operator { background: #e3f2fd; }

.metric-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.metric-content p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.metric-content small {
  color: #8a94a6;
  font-size: 0.8rem;
  margin-top: 5px;
  display: block;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.badge {
  background: #4e73df;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.ticket-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.2s ease;
}

.ticket-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f8f9fa;
}

.ticket-plate {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.vehicle-type {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-item .label {
  color: #6c757d;
  font-size: 0.8rem;
}

.info-item .value {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
}

.weekly-income {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 10px;
  height: 200px;
}

.income-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.day-name {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 10px;
}

.income-bar-container {
  height: 120px;
  width: 100%;
  display: flex;
  align-items: end;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.income-bar {
  background: linear-gradient(180deg, #4e73df, #2e59d9);
  width: 100%;
  border-radius: 4px;
  transition: height 0.3s ease;
  min-height: 4px;
}

.income-amount {
  font-size: 0.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.ticket-count {
  font-size: 0.7rem;
  color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

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

.error-alert {
  background: #fee;
  color: #c33;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #c33;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .tickets-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .weekly-income {
    flex-wrap: wrap;
    height: auto;
  }

  .income-day {
    flex: 0 0 calc(33.333% - 10px);
    margin-bottom: 20px;
  }
}
</style>
