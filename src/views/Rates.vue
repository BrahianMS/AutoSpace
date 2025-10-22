<template>
  <div class="rates">
    <!-- Header -->
    <div class="page-header">
      <h1>💰 Gestión de Tarifas - AutoSpace</h1>
      <p class="subtitle">Configura las tarifas por tipo de vehículo</p>
      <button @click="mostrarModal = true" class="btn btn-primary">
        ➕ Nueva Tarifa
      </button>
    </div>

    <!-- Tarifas Activas por Tipo de Vehículo -->
    <div class="active-rates-section">
      <h3>🚗 Tarifas Actualmente Activas</h3>
      <div class="rates-grid">
        <div 
          v-for="rate in tarifasActivas" 
          :key="rate.id" 
          class="rate-card active"
        >
          <div class="rate-header">
            <h4>{{ rate.typeVehicle }}</h4>
            <span class="badge active-badge">ACTIVA</span>
          </div>
          <div class="rate-details">
            <div class="rate-item">
              <span class="label">Hora:</span>
              <span class="value">${{ rate.hourPrice }}</span>
            </div>
            <div class="rate-item">
              <span class="label">Fracción (15min):</span>
              <span class="value">${{ rate.addPrice }}</span>
            </div>
            <div class="rate-item">
              <span class="label">Tope Diario:</span>
              <span class="value">${{ (rate.maxPrice || 0)}}</span>
            </div>
            <div class="rate-item">
              <span class="label">Tiempo Gracia:</span>
              <span class="value">{{ rate.graceTime }}</span>
            </div>
          </div>
          <div class="rate-actions">
            <button @click="editarRate(rate)" class="btn btn-sm btn-outline-primary">
              ✏️ Editar
            </button>
          </div>
        </div>
        
        <div v-if="tarifasActivas.length === 0" class="no-rates">
          <p>No hay tarifas activas configuradas</p>
          <button @click="mostrarModal = true" class="btn btn-primary">
            Crear primera tarifa
          </button>
        </div>
      </div>
    </div>

    <!-- Historial de Tarifas -->
    <div class="history-section">
      <div class="section-header">
        <h3>📜 Historial de Tarifas</h3>
        <div class="filters">
          <select v-model="filtroTipoVehiculo" class="form-control-sm">
            <option value="">Todos los tipos</option>
            <option value="Carro">Carro</option>
            <option value="Moto">Moto</option>
          </select>
        </div>
      </div>
      
      <div class="table-container">
        <table class="rates-table">
          <thead>
            <tr>
              <th>Tipo Vehículo</th>
              <th>Precio Hora</th>
              <th>Precio Fracción</th>
              <th>Tope Diario</th>
              <th>Tiempo Gracia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rate in ratesFiltradas" :key="rate.id">
              <td>
                <strong>{{ rate.typeVehicle }}</strong>
              </td>
              <td>${{ rate.hourPrice }}</td>
              <td>${{ rate.addPrice}}</td>
              <td>${{ (rate.maxPrice || 0) }}</td>
              <td>{{ rate.graceTime }}</td>
              <td>
                <span :class="['status-badge', rate.status === 'Active' ? 'active' : 'inactive']">
                  {{ rate.status === 'Active' ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="editarRate(rate)" 
                    class="btn-icon"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    v-if="rate.status === 'Inactive'"
                    @click="activarRate(rate)" 
                    class="btn-icon success"
                    title="Activar"
                  >
                    ✅
                  </button>
                  <button 
                    v-if="rate.status === 'Active'"
                    @click="desactivarRate(rate.id)" 
                    class="btn-icon warning"
                    title="Desactivar"
                  >
                    ⏸️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="ratesFiltradas.length === 0" class="empty-state">
          <p>No hay tarifas en el historial</p>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar tarifa -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ rateEditar ? 'Editar' : 'Nueva' }} Tarifa</h3>
          <button @click="cerrarModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="guardarRate" class="rate-form">
            <div class="form-group">
              <label>Tipo de Vehículo *</label>
              <select 
                v-model="formData.typeVehicle"
                required
                class="form-control"
              >
                <option value="">Seleccionar tipo...</option>
                <option value="Carro">Carro</option>
                <option value="Moto">Moto</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Precio por Hora ($) *</label>
                <input 
                  type="number" 
                  v-model.number="formData.hourPrice"
                  required
                  min="0"
                  step="100"
                  class="form-control"
                >
                <small class="help-text">Costo por hora completa</small>
              </div>
              
              <div class="form-group">
                <label>Precio por Fracción ($) *</label>
                <input 
                  type="number" 
                  v-model.number="formData.addPrice"
                  required
                  min="0"
                  step="100"
                  class="form-control"
                >
                <small class="help-text">Costo adicional por 15 minutos</small>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Tope Diario ($)</label>
                <input 
                  type="number" 
                  v-model.number="formData.maxPrice"
                  min="0"
                  step="1000"
                  class="form-control"
                  placeholder="Opcional"
                >
                <small class="help-text">Máximo a cobrar por día (0 = sin tope)</small>
              </div>
              
              <div class="form-group">
                <label>Tiempo de Gracia *</label>
                <select 
                  v-model="formData.graceTime"
                  required
                  class="form-control"
                >
                  <option :value="30">30 minutos</option>
                  <option :value="45">45 minutos</option>
                  <option :value="60">1 hora</option>
                </select>
                <small class="help-text">Tiempo sin cargo al ingresar</small>
              </div>
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
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="guardarRate" class="btn btn-primary" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (rateEditar ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Información de Ayuda -->
    <div class="help-section">
      <div class="help-card">
        <h4>💡 Información sobre Tarifas</h4>
        <div class="help-content">
          <div class="help-item">
            <strong>Precio por Fracción:</strong> Se cobra cada 15 minutos después de la primera hora.
          </div>
          <div class="help-item">
            <strong>Tope Diario:</strong> Límite máximo que pagará un vehículo en 24 horas.
          </div>
          <div class="help-item">
            <strong>Tiempo de Gracia:</strong> Período inicial sin costo alguno.
          </div>
          <div class="help-item">
            <strong>Tipos de Vehículo:</strong> Configure tarifas diferentes según el tipo.
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
  name: 'Rates',
  setup() {
    const appStore = useAppStore()
    const mostrarModal = ref(false)
    const rateEditar = ref(null)
    const guardando = ref(false)
    const filtroTipoVehiculo = ref('')

    const formData = reactive({
      typeVehicle: '',
      hourPrice: 0,
      addPrice: 0,
      maxPrice: 0,
      graceTime: '30 minutos',
      status: 'Active'
    })

    // Computed para tarifas activas
    const tarifasActivas = computed(() => {
      return appStore.rates.filter(rate => rate.status === 'Active')
    })

    // Computed para rates filtradas
    const ratesFiltradas = computed(() => {
      let filtered = appStore.rates

      if (filtroTipoVehiculo.value) {
        filtered = filtered.filter(rate => rate.typeVehicle === filtroTipoVehiculo.value)
      }

      return filtered
    })

    const guardarRate = async () => {
      try {
        guardando.value = true
        
        if (rateEditar.value) {
          await appStore.updateRate(rateEditar.value.id, formData)
        } else {
          await appStore.createRate(formData)
        }
        
        cerrarModal()
      } catch (error) {
        console.error('Error guardando tarifa:', error)
      } finally {
        guardando.value = false
      }
    }

    const editarRate = (rate) => {
      rateEditar.value = rate
      formData.typeVehicle = rate.typeVehicle
      formData.hourPrice = rate.hourPrice
      formData.addPrice = rate.addPrice
      formData.maxPrice = rate.maxPrice || 0
      formData.graceTime = rate.graceTime
      formData.status = rate.status
      mostrarModal.value = true
    }

    const activarRate = async (rate) => {
      if (confirm(`¿Está seguro de activar la tarifa para ${rate.typeVehicle}?`)) {
        try {
          await appStore.updateRate(rate.id, { status: 'Active' })
        } catch (error) {
          console.error('Error activando tarifa:', error)
        }
      }
    }

    const desactivarRate = async (id) => {
      if (confirm('¿Está seguro de desactivar esta tarifa?')) {
        try {
          await appStore.updateRate(id, { status: 'Inactive' })
        } catch (error) {
          console.error('Error desactivando tarifa:', error)
        }
      }
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      rateEditar.value = null
      // Reset form
      Object.keys(formData).forEach(key => {
        if (key === 'graceTime') {
          formData[key] = '30 minutos'
        } else if (key === 'status') {
          formData[key] = 'Active'
        } else if (key === 'hourPrice' || key === 'addPrice' || key === 'maxPrice') {
          formData[key] = 0
        } else {
          formData[key] = ''
        }
      })
    }

    onMounted(async () => {
      await appStore.fetchRates()
    })

    return {
      rates: appStore.rates,
      tarifasActivas,
      ratesFiltradas,
      mostrarModal,
      rateEditar,
      formData,
      guardando,
      filtroTipoVehiculo,
      loading: appStore.loading,
      guardarRate,
      editarRate,
      activarRate,
      desactivarRate,
      cerrarModal
    }
  }
}
</script>

<style scoped>
.rates {
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

/* Tarifas Activas */
.active-rates-section {
  margin-bottom: 30px;
}

.active-rates-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.rate-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #4e73df;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.rate-card.active {
  border-left-color: #28a745;
}

.rate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rate-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.active-badge {
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.rate-details {
  margin-bottom: 15px;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.rate-item:last-child {
  border-bottom: none;
}

.rate-item .label {
  color: #6c757d;
  font-size: 0.9rem;
}

.rate-item .value {
  font-weight: bold;
  color: #2c3e50;
}

.rate-actions {
  text-align: right;
}

.no-rates {
  text-align: center;
  padding: 40px;
  grid-column: 1 / -1;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.no-rates p {
  margin-bottom: 15px;
  color: #6c757d;
}

/* Historial */
.history-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.filters {
  display: flex;
  gap: 10px;
}

.table-container {
  overflow-x: auto;
}

.rates-table {
  width: 100%;
  border-collapse: collapse;
}

.rates-table th,
.rates-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.rates-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
}

.rates-table tr:hover {
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
  background: #e2e3e5;
  color: #383d41;
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

.btn-icon.success:hover {
  background: #d4edda;
}

.btn-icon.warning:hover {
  background: #fff3cd;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
}

/* Sección de Ayuda */
.help-section {
  margin-top: 30px;
}

.help-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 25px;
}

.help-card h4 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.help-item:last-child {
  border-bottom: none;
}

.help-item strong {
  display: block;
  margin-bottom: 2px;
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

.rate-form {
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
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 5px;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .rates-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modal-content {
    margin: 20px;
  }
}
</style>