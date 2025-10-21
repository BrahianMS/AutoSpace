<template>
  <div class="users">
    <!-- Header -->
    <div class="page-header">
      <h1>👥 Gestión de Usuarios - AutoSpace</h1>
      <p class="subtitle">Administra los usuarios del sistema</p>
      <button @click="mostrarModal = true" class="btn btn-primary">
        ➕ Nuevo Usuario
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-content">
          <h3>{{ stats.total }}</h3>
          <p>Total Usuarios</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🚗</div>
        <div class="stat-content">
          <h3>{{ stats.conVehiculos }}</h3>
          <p>Con Vehículos</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <h3>{{ stats.conSubscripciones }}</h3>
          <p>Con Mensualidades</p>
        </div>
      </div>
    </div>

    <!-- Tabla de Usuarios -->
    <div class="table-card">
      <div class="table-header">
        <h3>Lista de Usuarios</h3>
        <div class="table-actions">
          <input 
            type="text" 
            v-model="filtroBusqueda"
            placeholder="Buscar por nombre o documento..."
            class="form-control-sm"
          >
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Documento</th>
              <th>Email</th>
              <th>Vehículos</th>
              <th>Mensualidades</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usersFiltrados" :key="user.id">
              <td>
                <div class="user-info">
                  <strong>{{ user.fullName }}</strong>
                </div>
              </td>
              <td>{{ user.document || 'N/A' }}</td>
              <td>{{ user.email || 'N/A' }}</td>
              <td>
                <span class="badge count-badge">
                  {{ contarVehiculosUsuario(user.id) }}
                </span>
              </td>
              <td>
                <span class="badge count-badge">
                  {{ contarMensualidadesUsuario(user.id) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', user.status === 'Active' ? 'active' : 'inactive']">
                  {{ user.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="editarUser(user)" 
                    class="btn-icon"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="verVehiculos(user)" 
                    class="btn-icon info"
                    title="Ver vehículos"
                  >
                    🚗
                  </button>
                  <button 
                    @click="verMensualidades(user)" 
                    class="btn-icon success"
                    title="Ver mensualidades"
                  >
                    📅
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="usersFiltrados.length === 0" class="empty-state">
          <p>No se encontraron usuarios</p>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar usuario -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ userEditar ? 'Editar' : 'Nuevo' }} Usuario</h3>
          <button @click="cerrarModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="guardarUser" class="user-form">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input 
                type="text" 
                v-model="formData.fullName"
                required
                placeholder="María González López"
                class="form-control"
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Documento</label>
                <input 
                  type="text" 
                  v-model="formData.document"
                  placeholder="12345678"
                  class="form-control"
                >
              </div>
              
              <div class="form-group">
                <label>Estado *</label>
                <select 
                  v-model="formData.status"
                  required
                  class="form-control"
                >
                  <option value="Active">Activo</option>
                  <option value="Inactive">Inactivo</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                v-model="formData.email"
                placeholder="usuario@ejemplo.com"
                class="form-control"
              >
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="guardarUser" class="btn btn-primary" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (userEditar ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para gestionar vehículos del usuario -->
    <div v-if="mostrarModalVehiculos" class="modal-overlay" @click="cerrarModalVehiculos">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>🚗 Vehículos de {{ usuarioSeleccionado?.fullName }}</h3>
          <button @click="cerrarModalVehiculos" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div class="vehicles-section">
            <div class="section-header">
              <h4>Vehículos Registrados</h4>
              <button @click="abrirModalNuevoVehiculo()" class="btn btn-sm btn-primary">
                ➕ Agregar Vehículo
              </button>
            </div>
            
            <div v-if="vehiculosUsuario.length === 0" class="empty-state">
              <p>No hay vehículos registrados</p>
            </div>
            
            <div v-else class="vehicles-list">
              <div v-for="vehicle in vehiculosUsuario" :key="vehicle.id" class="vehicle-item">
                <div class="vehicle-info">
                  <span class="vehicle-plate">{{ vehicle.plate }}</span>
                  <span class="vehicle-type">{{ vehicle.type }}</span>
                </div>
                <div class="vehicle-actions">
                  <button @click="editarVehiculo(vehicle)" class="btn-icon" title="Editar">
                    ✏️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarModalVehiculos" class="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar vehículo -->
    <div v-if="mostrarModalNuevoVehiculo" class="modal-overlay" @click="cerrarModalNuevoVehiculo">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ vehiculoEditar ? 'Editar' : 'Nuevo' }} Vehículo</h3>
          <button @click="cerrarModalNuevoVehiculo" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <form class="vehicle-form">
            <div class="form-group">
              <label>Placa *</label>
              <input 
                type="text" 
                v-model="formVehiculo.plate"
                required
                placeholder="ABC123"
                class="form-control"
                style="text-transform: uppercase;"
              >
            </div>
            
            <div class="form-group">
              <label>Tipo de Vehículo *</label>
              <select 
                v-model="formVehiculo.type"
                required
                class="form-control"
              >
                <option value="">Seleccionar tipo...</option>
                <option value="Carro">Carro</option>
                <option value="Moto">Moto</option>
                <option value="Camioneta">Camioneta</option>
                <option value="Camión">Camión</option>
              </select>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarModalNuevoVehiculo" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="guardarVehiculo" class="btn btn-primary" :disabled="guardandoVehiculo">
            {{ guardandoVehiculo ? 'Guardando...' : (vehiculoEditar ? 'Actualizar' : 'Crear') }}
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
  name: 'Users',
  setup() {
    const appStore = useAppStore()
    const mostrarModal = ref(false)
    const userEditar = ref(null)
    const guardando = ref(false)
    const filtroBusqueda = ref('')

    // Nuevos estados para gestión de vehículos
    const mostrarModalVehiculos = ref(false)
    const mostrarModalNuevoVehiculo = ref(false)
    const usuarioSeleccionado = ref(null)
    const vehiculoEditar = ref(null) // CORREGIDO: Inicializado como null
    const guardandoVehiculo = ref(false)

    const formData = reactive({
      fullName: '',
      document: '',
      email: '',
      status: 'Active'
    })

    const formVehiculo = reactive({
      plate: '',
      type: '',
      userId: ''
    })

    // Computed para estadísticas
    const stats = computed(() => {
      const total = appStore.users.length
      const conVehiculos = appStore.users.filter(user => contarVehiculosUsuario(user.id) > 0).length
      const conSubscripciones = appStore.users.filter(user => contarMensualidadesUsuario(user.id) > 0).length
      return { total, conVehiculos, conSubscripciones }
    })

    // Computed para usuarios filtrados
    const usersFiltrados = computed(() => {
      let filtered = appStore.users

      if (filtroBusqueda.value) {
        const search = filtroBusqueda.value.toLowerCase()
        filtered = filtered.filter(user => 
          user.fullName.toLowerCase().includes(search) ||
          (user.document && user.document.toLowerCase().includes(search)) ||
          (user.email && user.email.toLowerCase().includes(search))
        )
      }

      return filtered
    })

    // Computed para vehículos del usuario seleccionado
    const vehiculosUsuario = computed(() => {
      if (!usuarioSeleccionado.value) return []
      return appStore.vehicles.filter(v => v.userId === usuarioSeleccionado.value.id)
    })

    // Métodos para contar relaciones
    const contarVehiculosUsuario = (userId) => {
      return appStore.vehicles.filter(vehicle => vehicle.userId === userId).length
    }

    const contarMensualidadesUsuario = (userId) => {
      return appStore.subscriptions.filter(sub => sub.userId === userId).length
    }

    const guardarUser = async () => {
      try {
        guardando.value = true
        
        if (userEditar.value) {
          await appStore.updateUser(userEditar.value.id, formData)
        } else {
          await appStore.createUser(formData)
        }
        
        cerrarModal()
      } catch (error) {
        console.error('Error guardando usuario:', error)
      } finally {
        guardando.value = false
      }
    }

    const editarUser = (user) => {
      userEditar.value = user
      formData.fullName = user.fullName
      formData.document = user.document
      formData.email = user.email
      formData.status = user.status
      mostrarModal.value = true
    }

    const verVehiculos = (user) => {
      usuarioSeleccionado.value = user
      formVehiculo.userId = user.id
      mostrarModalVehiculos.value = true
    }

    const verMensualidades = (user) => {
      alert(`Mostrando mensualidades de ${user.fullName}`)
      // Aquí podrías implementar navegación a una vista específica o filtro en mensualidades
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      userEditar.value = null
      // Reset form
      Object.keys(formData).forEach(key => {
        if (key === 'status') {
          formData[key] = 'Active'
        } else {
          formData[key] = ''
        }
      })
    }

    // Métodos para gestión de vehículos
    const abrirModalNuevoVehiculo = () => {
      vehiculoEditar.value = null // Asegurar que sea null para crear nuevo
      formVehiculo.plate = ''
      formVehiculo.type = ''
      mostrarModalNuevoVehiculo.value = true
    }

    const cerrarModalVehiculos = () => {
      mostrarModalVehiculos.value = false
      usuarioSeleccionado.value = null
      vehiculoEditar.value = null // CORREGIDO: Resetear al cerrar
    }

    const cerrarModalNuevoVehiculo = () => {
      mostrarModalNuevoVehiculo.value = false
      vehiculoEditar.value = null // CORREGIDO: Resetear al cerrar
      formVehiculo.plate = ''
      formVehiculo.type = ''
    }

    const guardarVehiculo = async () => {
      try {
        guardandoVehiculo.value = true
        
        // Preparar datos con relaciones requeridas
        const vehicleData = {
          plate: formVehiculo.plate.toUpperCase(),
          type: formVehiculo.type,
          userId: parseInt(formVehiculo.userId),
          tickets: [], // Agregar arrays vacíos para las relaciones
          subscriptions: []
        }
        
        if (vehiculoEditar.value) {
          await appStore.updateVehicle(vehiculoEditar.value.id, vehicleData)
        } else {
          await appStore.createVehicle(vehicleData)
        }
        
        cerrarModalNuevoVehiculo()
      } catch (error) {
        console.error('Error guardando vehículo:', error)
      } finally {
        guardandoVehiculo.value = false
      }
    }

    const editarVehiculo = (vehicle) => {
      vehiculoEditar.value = vehicle
      formVehiculo.plate = vehicle.plate
      formVehiculo.type = vehicle.type
      formVehiculo.userId = vehicle.userId.toString()
      mostrarModalNuevoVehiculo.value = true
    }

    onMounted(async () => {
      await Promise.all([
        appStore.fetchUsers(),
        appStore.fetchVehicles(),
        appStore.fetchSubscriptions()
      ])
    })

    return {
      users: appStore.users,
      usersFiltrados,
      mostrarModal,
      userEditar,
      formData,
      guardando,
      filtroBusqueda,
      stats,
      loading: appStore.loading,
      
      // Nuevas propiedades para gestión de vehículos
      mostrarModalVehiculos,
      mostrarModalNuevoVehiculo,
      usuarioSeleccionado,
      vehiculosUsuario,
      formVehiculo,
      guardandoVehiculo,
      vehiculoEditar, // CORREGIDO: Exportado correctamente
      
      // Métodos
      guardarUser,
      editarUser,
      verVehiculos,
      verMensualidades,
      contarVehiculosUsuario,
      contarMensualidadesUsuario,
      cerrarModal,
      
      // Métodos para vehículos
      cerrarModalVehiculos,
      cerrarModalNuevoVehiculo,
      guardarVehiculo,
      editarVehiculo,
      abrirModalNuevoVehiculo
    }
  }
}
</script>

<style scoped>
.users {
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

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  border-radius: 12px;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Tabla */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.table-header h3 {
  margin: 0;
  color: #2c3e50;
}

.table-actions {
  display: flex;
  gap: 10px;
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

.badge.count-badge {
  background: #4e73df;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
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

.btn-icon.info:hover {
  background: #cce7ff;
}

.btn-icon.success:hover {
  background: #d4edda;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 600px;
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

.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vehicle-form {
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

.form-control-sm {
  padding: 6px 10px;
  font-size: 0.9rem;
}

/* Sección de vehículos */
.vehicles-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #2c3e50;
}

.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vehicle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
  transition: background-color 0.2s;
}

.vehicle-item:hover {
  background: #e9ecef;
}

.vehicle-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vehicle-plate {
  font-weight: bold;
  color: #2c3e50;
  font-family: monospace;
  font-size: 1.1rem;
}

.vehicle-type {
  color: #6c757d;
  font-size: 0.9rem;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.vehicle-actions {
  display: flex;
  gap: 5px;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modal-content {
    margin: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .vehicle-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .vehicle-actions {
    align-self: flex-end;
  }
}
</style>