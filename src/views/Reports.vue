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
              v-model="filters.startDate"
              class="form-control"
            >
          </div>
          <div class="form-group">
            <label>Fecha Fin</label>
            <input 
              type="date" 
              v-model="filters.endDate"
              class="form-control"
            >
          </div>
          <div class="form-group">
            <label>Tipo de Reporte</label>
            <select v-model="filters.reportType" class="form-control">
              <option value="income">💰 Ingresos</option>
              <option value="subscriptions">📅 Suscripciones</option>
              <option value="users">👥 Usuarios</option>
              <option value="operators">👨‍💼 Operadores</option>
              <option value="vehicles">🚗 Vehículos</option>
            </select>
          </div>
          <button @click="fetchTickets" class="btn btn-primary" :disabled="loading">
            🔍 Aplicar Filtros
          </button>
          <button @click="exportReport" class="btn btn-success" :disabled="loading">
            📊 Exportar a Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen de Métricas -->
    <div v-if="reportData" class="metrics-summary">
      <h3>📊 Resumen General</h3>
      <div class="metrics-grid">
        <!-- Métricas para Reporte de Ingresos -->
        <div v-if="filters.reportType === 'income'" class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h4>${{ reportData.totalIncome?.toLocaleString() || '0' }}</h4>
            <p>Ingresos Totales</p>
          </div>
        </div>
        <div v-if="filters.reportType === 'income'" class="metric-card">
          <div class="metric-icon">🚗</div>
          <div class="metric-content">
            <h4>{{ reportData.totalVehicles || '0' }}</h4>
            <p>Vehículos Totales</p>
          </div>
        </div>

        <!-- Métricas para Reporte de Suscripciones -->
        <div v-if="filters.reportType === 'subscriptions'" class="metric-card">
          <div class="metric-icon">📅</div>
          <div class="metric-content">
            <h4>{{ reportData.totalSubscriptions || '0' }}</h4>
            <p>Total Suscripciones</p>
          </div>
        </div>
        <div v-if="filters.reportType === 'subscriptions'" class="metric-card">
          <div class="metric-icon">✅</div>
          <div class="metric-content">
            <h4>{{ reportData.activeSubscriptions || '0' }}</h4>
            <p>Activas</p>
          </div>
        </div>
        <div v-if="filters.reportType === 'subscriptions'" class="metric-card">
          <div class="metric-icon">❌</div>
          <div class="metric-content">
            <h4>{{ reportData.expiredSubscriptions || '0' }}</h4>
            <p>Expiradas</p>
          </div>
        </div>
        <div v-if="filters.reportType === 'subscriptions'" class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h4>${{ reportData.totalRevenue?.toLocaleString() || '0' }}</h4>
            <p>Ingresos Totales</p>
          </div>
        </div>

        <!-- Métricas para Reporte de Usuarios -->
        <div v-if="filters.reportType === 'users'" class="metric-card">
          <div class="metric-icon">👥</div>
          <div class="metric-content">
            <h4>{{ reportData.totalUsers || '0' }}</h4>
            <p>Total Usuarios</p>
          </div>
        </div>
        <div v-if="filters.reportType === 'users'" class="metric-card">
          <div class="metric-icon">✅</div>
          <div class="metric-content">
            <h4>{{ reportData.activeUsers || '0' }}</h4>
            <p>Usuarios Activos</p>
          </div>
        </div>

        <!-- Métricas para Reporte de Operadores -->
        <div v-if="filters.reportType === 'operators'" class="metric-card">
          <div class="metric-icon">👨‍💼</div>
          <div class="metric-content">
            <h4>{{ reportData.totalOperators || '0' }}</h4>
            <p>Total Operadores</p>
          </div>
        </div>
        <div v-if="filters.reportType === 'operators'" class="metric-card">
          <div class="metric-icon">✅</div>
          <div class="metric-content">
            <h4>{{ reportData.activeOperators || '0' }}</h4>
            <p>Operadores Activos</p>
          </div>
        </div>

        <!-- Métricas para Reporte de Vehículos -->
        <div v-if="filters.reportType === 'vehicles'" class="metric-card">
          <div class="metric-icon">🚗</div>
          <div class="metric-content">
            <h4>{{ reportData.totalVehicles || '0' }}</h4>
            <p>Vehículos Activos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Datos Detallados -->
    <div v-if="reportData && !loading" class="detailed-data">
      <!-- Reporte de Ingresos -->
      <div v-if="filters.reportType === 'income' && reportData.dailyIncomes" class="chart-section">
        <h3>📈 Ingresos por Día</h3>
        <div class="chart-container">
          <div v-if="reportData.dailyIncomes.length === 0" class="empty-state">
            <p>No hay datos de ingresos para el período seleccionado</p>
          </div>
          <div v-else class="income-chart">
            <div v-for="day in reportData.dailyIncomes" :key="day.date" class="income-bar">
              <div class="bar-label">{{ formatShortDate(day.date) }}</div>
              <div class="bar-container">
                <div 
                  class="bar-fill" 
                  :style="{ height: calculateBarHeight(day.amount) + '%' }"
                  :title="`$${day.amount.toLocaleString()}`"
                ></div>
              </div>
              <div class="bar-value">${{ day.amount.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reporte de Suscripciones -->
      <div v-if="filters.reportType === 'subscriptions' && reportData.subscriptions" class="data-section">
        <h3>📋 Detalle de Suscripciones</h3>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in reportData.subscriptions" :key="sub.id">
                <td>{{ sub.vehiclePlate }}</td>
                <td>{{ sub.vehicleType }}</td>
                <td>{{ sub.userName }}</td>
                <td>{{ formatDate(sub.startDate) }}</td>
                <td>{{ formatDate(sub.endDate) }}</td>
                <td>${{ sub.monthlyPrice.toLocaleString() }}</td>
                <td>
                  <span :class="['status-badge', sub.status.toLowerCase()]">
                    {{ sub.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reporte de Usuarios -->
      <div v-if="filters.reportType === 'users' && reportData.userPerformances" class="data-section">
        <h3>👥 Desempeño de Usuarios</h3>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Documento</th>
                <th>Suscripciones</th>
                <th>Ingresos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in reportData.userPerformances" :key="user.userId">
                <td>{{ user.userName }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.document }}</td>
                <td>{{ user.totalSubscriptions }}</td>
                <td>${{ user.totalRevenue.toLocaleString() }}</td>
                <td>
                  <span :class="['status-badge', user.status.toLowerCase()]">
                    {{ user.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reporte de Operadores -->
      <div v-if="filters.reportType === 'operators' && reportData.operatorPerformances" class="data-section">
        <h3>👨‍💼 Desempeño de Operadores</h3>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Operador</th>
                <th>Email</th>
                <th>Documento</th>
                <th>Tickets</th>
                <th>Pagos</th>
                <th>Turnos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="operator in reportData.operatorPerformances" :key="operator.operatorId">
                <td>{{ operator.operatorName }}</td>
                <td>{{ operator.email }}</td>
                <td>{{ operator.document }}</td>
                <td>{{ operator.totalTickets }}</td>
                <td>{{ operator.totalPayments }}</td>
                <td>{{ operator.totalShifts }}</td>
                <td>
                  <span :class="['status-badge', operator.isActive ? 'active' : 'inactive']">
                    {{ operator.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reporte de Vehículos -->
      <div v-if="filters.reportType === 'vehicles' && reportData.vehicleStats" class="data-section">
        <h3>🚗 Estadísticas de Vehículos</h3>
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Suscripciones</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vehicle in reportData.vehicleStats" :key="vehicle.vehicleId">
                <td>{{ vehicle.plate }}</td>
                <td>{{ vehicle.type }}</td>
                <td>{{ vehicle.totalSubscriptions }}</td>
                <td>${{ vehicle.totalRevenue.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Generando reporte...</p>
      </div>
    </div>

    <!-- Mensaje de Error -->
    <div v-if="error" class="error-message">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <div class="error-text">
          <h4>Error al cargar reportes</h4>
          <p>{{ error }}</p>
        </div>
        <button @click="error = ''" class="btn btn-secondary">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { reportsService } from '@/services/api'

export default {
  name: 'Reports',
  setup() {
    const appStore = useAppStore()
    const loading = ref(false)
    const error = ref('')
    const reportData = ref(null)

    const filters = reactive({
      startDate: '',
      endDate: '',
      reportType: 'income'
    })

    // FUNCIÓN PRINCIPAL CORREGIDA - usa los servicios reales
    const fetchTickets = async (customFilters = {}) => {
      try {
        loading.value = true
        error.value = ''

        const effectiveFilters = { ...filters, ...customFilters }
        console.log('🔍 Solicitando reporte con filtros:', effectiveFilters)

        let response
        switch (effectiveFilters.reportType) {
          case 'income':
            response = await reportsService.getIncomeReport(effectiveFilters)
            break
          case 'subscriptions':
            response = await reportsService.getSubscriptionsReport(effectiveFilters)
            break
          case 'users':
            response = await reportsService.getUsersReport(effectiveFilters)
            break
          case 'operators':
            response = await reportsService.getOperatorsReport(effectiveFilters)
            break
          case 'vehicles':
            response = await reportsService.getVehiclesReport(effectiveFilters)
            break
          default:
            response = await reportsService.getIncomeReport(effectiveFilters)
        }

        reportData.value = response.data
        console.log('✅ Reporte recibido:', reportData.value)
        return response.data
        
      } catch (err) {
        console.error('❌ Error cargando reportes:', err)
        error.value = err.response?.data?.message || err.response?.data || 'Error al cargar el reporte'
        throw err
      } finally {
        loading.value = false
      }
    }

    const exportReport = async () => {
      try {
        loading.value = true
        error.value = ''

        // Por ahora, creamos un archivo CSV simple hasta que implementemos el backend de exportación
        const data = reportData.value
        if (!data) {
          alert('No hay datos para exportar')
          return
        }

        let csvContent = "data:text/csv;charset=utf-8,"
        
        switch (filters.reportType) {
          case 'income':
            csvContent += "Fecha,Ingreso,Vehículos\n"
            if (data.dailyIncomes) {
              data.dailyIncomes.forEach(day => {
                csvContent += `${formatDate(day.date)},${day.amount},${day.vehicleCount}\n`
              })
            }
            break
          case 'subscriptions':
            csvContent += "Placa,Tipo,Usuario,Inicio,Fin,Precio,Estado\n"
            if (data.subscriptions) {
              data.subscriptions.forEach(sub => {
                csvContent += `${sub.vehiclePlate},${sub.vehicleType},${sub.userName},${formatDate(sub.startDate)},${formatDate(sub.endDate)},${sub.monthlyPrice},${sub.status}\n`
              })
            }
            break
          // Agregar más casos según sea necesario
        }

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `reporte_${filters.reportType}_${filters.startDate}_${filters.endDate}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
      } catch (err) {
        console.error('❌ Error exportando reporte:', err)
        error.value = 'Error al exportar el reporte'
      } finally {
        loading.value = false
      }
    }

    // Funciones de utilidad
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES')
    }

    const formatShortDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      })
    }

    const calculateBarHeight = (amount) => {
      if (!reportData.value?.dailyIncomes?.length) return 0
      const maxAmount = Math.max(...reportData.value.dailyIncomes.map(d => d.amount))
      return maxAmount > 0 ? (amount / maxAmount) * 100 : 0
    }

    onMounted(async () => {
      // Establecer fechas por defecto (últimos 30 días)
      const hoy = new Date()
      const hace30Dias = new Date(hoy)
      hace30Dias.setDate(hoy.getDate() - 30)
      
      filters.startDate = hace30Dias.toISOString().split('T')[0]
      filters.endDate = hoy.toISOString().split('T')[0]

      // Cargar reporte inicial
      await fetchTickets()
    })

    return {
      loading,
      error,
      filters,
      reportData,
      fetchTickets,
      exportReport,
      formatDate,
      formatShortDate,
      calculateBarHeight
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

/* Gráficos */
.detailed-data {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-section,
.data-section {
  margin-bottom: 30px;
}

.chart-section:last-child,
.data-section:last-child {
  margin-bottom: 0;
}

.chart-section h3,
.data-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 10px;
}

.chart-container {
  overflow-x: auto;
}

.income-chart {
  display: flex;
  gap: 10px;
  align-items: end;
  min-height: 200px;
  padding: 20px 0;
}

.income-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 60px;
}

.bar-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
}

.bar-container {
  height: 150px;
  width: 40px;
  background: #f8f9fa;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, #4e73df, #2e59d9);
  border-radius: 4px;
  transition: height 0.3s ease;
}

.bar-value {
  font-size: 0.8rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Tablas */
.data-table {
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.expired {
  background: #fff3cd;
  color: #856404;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Mensaje de Error */
.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 15px;
  max-width: 400px;
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-content {
  display: flex;
  align-items: start;
  gap: 10px;
}

.error-icon {
  font-size: 1.2rem;
}

.error-text h4 {
  margin: 0 0 5px 0;
  color: #721c24;
  font-size: 1rem;
}

.error-text p {
  margin: 0;
  color: #721c24;
  font-size: 0.9rem;
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

.empty-state {
  text-align: center;
  padding: 30px;
  color: #6c757d;
  font-style: italic;
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
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .income-chart {
    gap: 5px;
  }
  
  .income-bar {
    min-width: 40px;
  }
  
  .bar-container {
    width: 30px;
  }
}
</style>