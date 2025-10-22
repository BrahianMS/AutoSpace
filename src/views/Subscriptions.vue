<template>
  <div class="subscriptions">
    <!-- Header -->
    <div class="page-header">
      <h1>📅 Gestión de Mensualidades - AutoSpace</h1>
      <p class="subtitle">Administra las mensualidades de los clientes</p>
      <button @click="mostrarModal = true" class="btn btn-primary">
        ➕ Nueva Mensualidad
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filter-group">
        <label>Estado:</label>
        <select v-model="filtroEstado" class="form-control">
          <option value="">Todos</option>
          <option value="Active">Activas</option>
          <option value="Inactive">Inactivas</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Buscar por placa:</label>
        <input 
          type="text" 
          v-model="filtroPlaca"
          placeholder="ABC123"
          class="form-control"
          @input="aplicarFiltros"
        >
      </div>
      <button @click="limpiarFiltros" class="btn btn-outline-secondary">🔄 Limpiar</button>
    </div>

    <!-- Tabla de mensualidades -->
    <div class="table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Placa</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Precio Mensual</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subscription in subscriptionsFiltradas" :key="subscription.id">
              <td>
                <div class="user-info">
                  <strong>{{ subscription.userFullName }}</strong>
                  <small>{{ subscription.user?.email }}</small>
                </div>
              </td>
              <td>
                <span class="plate-badge">{{ subscription.vehiclePlate }}</span>
              </td>
              <td>{{ formatFecha(subscription.startDate) }}</td>
              <td>
                <span :class="{'text-danger': estaProximaVencer(subscription.endDate)}">
                  {{ formatFecha(subscription.endDate) }}
                </span>
              </td>
              <td>${{ subscription.monthlyPrice.toLocaleString() }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(subscription.status)]">
                  {{ getStatusText(subscription.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="editarSubscription(subscription)" 
                    class="btn-icon"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    v-if="subscription.status === 'Active'"
                    @click="inactivarSubscription(subscription.id)" 
                    class="btn-icon warning"
                    title="Inactivar"
                  >
                    ⏸️
                  </button>
                  <button 
                    v-if="subscription.status === 'Inactive'"
                    @click="activarSubscription(subscription.id)" 
                    class="btn-icon success"
                    title="Activar"
                  >
                    ✅
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="subscriptionsFiltradas.length === 0" class="empty-state">
          <p>No se encontraron mensualidades</p>
          <button v-if="filtroEstado || filtroPlaca" @click="limpiarFiltros" class="btn btn-primary">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <h4>📊 Resumen Mensualidades</h4>
        <div class="stat-item">
          <span>Total Activas:</span>
          <strong>{{ stats.activas }}</strong>
        </div>
        <div class="stat-item">
          <span>Próximas a vencer:</span>
          <strong class="text-warning">{{ stats.proximasVencer }}</strong>
        </div>
        <div class="stat-item">
          <span>Ingresos mensuales:</span>
          <strong class="text-success">${{ stats.ingresosMensuales.toLocaleString() }}</strong>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar mensualidad -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ subscriptionEditar ? 'Editar' : 'Nueva' }} Mensualidad</h3>
          <button @click="cerrarModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="guardarSubscription" class="subscription-form">
            <!-- Selección de Usuario -->
            <div class="form-group">
              <label>Usuario *</label>
              <select 
                v-model="formData.userId"
                required
                class="form-control"
                @change="cargarVehiculosDelUsuario"
              >
                <option value="">Seleccionar usuario...</option>
                <option v-for="user in usuarios" :key="user.id" :value="user.id">
                  {{ user.fullName }} - {{ user.document }}
                </option>
              </select>
            </div>

            <!-- Selección de Vehículo -->
            <div class="form-group">
              <label>Vehículo *</label>
              <select 
                v-model="formData.vehicleId"
                required
                class="form-control"
                :disabled="!formData.userId"
              >
                <option value="">Seleccionar vehículo...</option>
                <option v-for="vehicle in vehiculosDelUsuario" :key="vehicle.id" :value="vehicle.id">
                  {{ vehicle.plate }} - {{ vehicle.type }}
                </option>
              </select>
              <small v-if="!formData.userId" class="help-text">
                Primero selecciona un usuario
              </small>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Fecha Inicio *</label>
                <input 
                  type="date" 
                  v-model="formData.startDate"
                  required
                  class="form-control"
                  :min="minStartDate"
                >
              </div>
              
              <div class="form-group">
                <label>Fecha Fin *</label>
                <input 
                  type="date" 
                  v-model="formData.endDate"
                  required
                  class="form-control"
                  :min="formData.startDate || minStartDate"
                >
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Precio Mensual ($) *</label>
                <input 
                  type="number" 
                  v-model.number="formData.monthlyPrice"
                  required
                  min="0"
                  step="1000"
                  class="form-control"
                  placeholder="0"
                >
              </div>
              
              <div class="form-group">
                <label>Estado *</label>
                <select 
                  v-model="formData.status"
                  required
                  class="form-control"
                >
                  <option value="Active">Activa</option>
                  <option value="Inactive">Inactiva</option>
                </select>
              </div>
            </div>

            <!-- Información de resumen -->
            <div v-if="formData.monthlyPrice > 0 && formData.startDate && formData.endDate" class="summary-card">
              <h5>Resumen de la Mensualidad</h5>
              <div class="summary-item">
                <span>Duración:</span>
                <strong>{{ calcularDuracion() }} días</strong>
              </div>
              <div class="summary-item">
                <span>Valor total:</span>
                <strong class="text-success">${{ calcularValorTotal().toLocaleString() }}</strong>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="guardarSubscription" class="btn btn-primary" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (subscriptionEditar ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import { useAppStore } from '@/stores/app'

export default {
  name: 'Subscriptions',
  setup() {
    const appStore = useAppStore()
    const mostrarModal = ref(false)
    const subscriptionEditar = ref(null)
    const guardando = ref(false)
    const filtroEstado = ref('')
    const filtroPlaca = ref('')

    const formData = reactive({
      userId: '',
      vehicleId: '',
      startDate: '',
      endDate: '',
      monthlyPrice: 0,
      status: 'Active'
    })

    // Fecha mínima para inicio (hoy)
    const minStartDate = new Date().toISOString().split('T')[0]

    // Computed para vehículos del usuario seleccionado
    const vehiculosDelUsuario = computed(() => {
      if (!formData.userId) return []
      return appStore.vehicles.filter(v => v.userId === parseInt(formData.userId))
    })

    // Computed para subscriptions filtradas - CORREGIDO: usa vehiclePlate
    const subscriptionsFiltradas = computed(() => {
      let filtered = appStore.subscriptions

      if (filtroEstado.value) {
        filtered = filtered.filter(s => s.status === filtroEstado.value)
      }

      if (filtroPlaca.value) {
        const placa = filtroPlaca.value.toLowerCase().trim()
        // CORRECCIÓN: Usar vehiclePlate en lugar de vehicle?.plate
        filtered = filtered.filter(s => 
          s.vehiclePlate?.toLowerCase().includes(placa)
        )
      }

      return filtered
    })

    // Computed para estadísticas
    const stats = computed(() => {
      const activas = appStore.activeSubscriptions.length
      const proximasVencer = appStore.expiringSubscriptions.length
      const ingresosMensuales = appStore.activeSubscriptions
        .reduce((sum, s) => sum + s.monthlyPrice, 0)

      return { activas, proximasVencer, ingresosMensuales }
    })

    const cargarVehiculosDelUsuario = () => {
      // Reset vehicleId cuando cambia el usuario
      formData.vehicleId = ''
    }

    const guardarSubscription = async () => {
      try {
        guardando.value = true
        
        // Validaciones básicas
        if (!formData.userId || !formData.vehicleId) {
          alert('Por favor selecciona un usuario y un vehículo')
          return
        }

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          alert('La fecha de fin debe ser posterior a la fecha de inicio')
          return
        }

        if (formData.monthlyPrice <= 0) {
          alert('El precio mensual debe ser mayor a 0')
          return
        }
        
        if (subscriptionEditar.value) {
          await appStore.updateSubscription(subscriptionEditar.value.id, formData)
        } else {
          await appStore.createSubscription(formData)
        }
        
        cerrarModal()
      } catch (error) {
        console.error('Error guardando mensualidad:', error)
        alert(error.response?.data?.error || 'Error guardando mensualidad')
      } finally {
        guardando.value = false
      }
    }

    const editarSubscription = (subscription) => {
      subscriptionEditar.value = subscription
      formData.userId = subscription.userId
      formData.vehicleId = subscription.vehicleId
      formData.startDate = subscription.startDate.split('T')[0] // Formato YYYY-MM-DD
      formData.endDate = subscription.endDate.split('T')[0] // Formato YYYY-MM-DD
      formData.monthlyPrice = subscription.monthlyPrice
      formData.status = subscription.status
      mostrarModal.value = true
    }

    const inactivarSubscription = async (id) => {
      if (confirm('¿Está seguro de inactivar esta mensualidad?')) {
        try {
          await appStore.inactivateSubscription(id)
        } catch (error) {
          console.error('Error inactivando mensualidad:', error)
          alert('Error inactivando mensualidad')
        }
      }
    }

    const activarSubscription = async (id) => {
      try {
        await appStore.updateSubscription(id, { status: 'Active' })
      } catch (error) {
        console.error('Error activando mensualidad:', error)
        alert('Error activando mensualidad')
      }
    }

    const aplicarFiltros = () => {
      // Los filtros se aplican automáticamente mediante computed
      console.log('Filtros aplicados:', { 
        estado: filtroEstado.value, 
        placa: filtroPlaca.value,
        resultados: subscriptionsFiltradas.value.length
      })
    }

    const limpiarFiltros = () => {
      filtroEstado.value = ''
      filtroPlaca.value = ''
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      subscriptionEditar.value = null
      // Reset form
      Object.keys(formData).forEach(key => {
        if (key === 'status') {
          formData[key] = 'Active'
        } else if (key === 'monthlyPrice') {
          formData[key] = 0
        } else {
          formData[key] = ''
        }
      })
    }

    const formatFecha = (fecha) => {
      if (!fecha) return 'N/A'
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const estaProximaVencer = (fechaFin) => {
      if (!fechaFin) return false
      const fin = new Date(fechaFin)
      const hoy = new Date()
      const diffTime = fin - hoy
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    }

    const getStatusClass = (status) => {
      const statusMap = {
        'Active': 'success',
        'Inactive': 'secondary',
        'Cancelled': 'danger'
      }
      return statusMap[status] || 'secondary'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'Active': 'Activa',
        'Inactive': 'Inactiva',
        'Cancelled': 'Cancelada'
      }
      return statusMap[status] || status
    }

    const calcularDuracion = () => {
      if (!formData.startDate || !formData.endDate) return 0
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = end - start
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const calcularValorTotal = () => {
      const duracion = calcularDuracion()
      const precioDiario = formData.monthlyPrice / 30 // Aproximación
      return Math.round(duracion * precioDiario)
    }

    onMounted(async () => {
      await Promise.all([
        appStore.fetchSubscriptions(),
        appStore.fetchUsers(),
        appStore.fetchVehicles()
      ])
    })

    return {
      subscriptions: appStore.subscriptions,
      subscriptionsFiltradas,
      usuarios: appStore.users,
      vehiculos: appStore.vehicles,
      vehiculosDelUsuario,
      mostrarModal,
      subscriptionEditar,
      formData,
      guardando,
      filtroEstado,
      filtroPlaca,
      stats,
      minStartDate,
      loading: appStore.loading,
      guardarSubscription,
      editarSubscription,
      inactivarSubscription,
      activarSubscription,
      aplicarFiltros,
      limpiarFiltros,
      cerrarModal,
      cargarVehiculosDelUsuario,
      formatFecha,
      estaProximaVencer,
      getStatusClass,
      getStatusText,
      calcularDuracion,
      calcularValorTotal
    }
  }
}
</script>

<style scoped>
.subscriptions {
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
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 15px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

/* Tabla */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
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
  color: #495057;
  position: sticky;
  top: 0;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info strong {
  color: #2c3e50;
}

.user-info small {
  color: #6c757d;
  font-size: 0.8rem;
}

.plate-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.9rem;
}

.text-danger {
  color: #dc3545;
  font-weight: bold;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.success {
  background: #d4edda;
  color: #155724;
}

.status-badge.secondary {
  background: #e2e3e5;
  color: #383d41;
}

.status-badge.danger {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #e9ecef;
}

.btn-icon.warning:hover {
  background: #fff3cd;
}

.btn-icon.success:hover {
  background: #d4edda;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-card h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.stat-item:last-child {
  border-bottom: none;
}

.text-warning {
  color: #856404;
}

.text-success {
  color: #155724;
}

/* Modal y Form */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.subscription-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
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

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 0.8rem;
  color: #6c757d;
}

/* Resumen de mensualidad */
.summary-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid #4e73df;
}

.summary-card h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline-primary {
  background: white;
  color: #4e73df;
  border: 1px solid #4e73df;
}

.btn-outline-primary:hover {
  background: #4e73df;
  color: white;
}

.btn-outline-secondary {
  background: white;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .modal-content {
    margin: 20px;
  }

  .data-table {
    font-size: 0.9rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 3px;
  }
}
</style>