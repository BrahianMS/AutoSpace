<template>
  <div class="operators">
    <!-- Header -->
    <div class="page-header">
      <h1>👨‍💼 Gestión de Operadores</h1>
      <p class="subtitle">Administra los operadores del parqueadero</p>
      <button @click="mostrarModal = true" class="btn btn-primary">
        ➕ Nuevo Operador
      </button>
    </div>

    <!-- Estadísticas Rápidas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>{{ stats.total }}</h3>
          <p>Total Operadores</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>{{ stats.activos }}</h3>
          <p>Operadores Activos</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>${{ stats.totalRecaudado.toLocaleString() }}</h3>
          <p>Total Recaudado</p>
        </div>
      </div>
    </div>

    <!-- Tabla de Operadores -->
    <div class="table-card">
      <div class="table-header">
        <h3>Lista de Operadores</h3>
        <div class="table-actions">
          <select v-model="filtroEstado" class="form-control-sm">
            <option value="">Todos los estados</option>
            <option value="Active">Activos</option>
            <option value="Inactive">Inactivos</option>
          </select>
          <input
            type="text"
            v-model="filtroBusqueda"
            placeholder="Buscar por nombre..."
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
            <th>Estado</th>
            <th>Tickets Procesados</th>
            <th>Total Recaudado</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="operator in operatorsFiltrados" :key="operator.id">
            <td>
              <div class="user-info">
                <strong>{{ operator.fullName }}</strong>
              </div>
            </td>
            <td>{{ operator.document || 'N/A' }}</td>
            <td>{{ operator.email || 'N/A' }}</td>
            <td>
                <span :class="['status-badge', operator.status === 'Active' ? 'active' : 'inactive']">
                  {{ operator.status === 'Active' ? 'Activo' : 'Inactivo' }}
                </span>
            </td>
            <td>{{ operator.ticketsProcessed || 0 }}</td>
            <td>${{ (operator.totalCollected || 0).toLocaleString() }}</td>
            <td>
              <div class="action-buttons">
                <button
                  @click="editarOperator(operator)"
                  class="btn-icon"
                  title="Editar"
                >
                  ✏️
                </button>

                <button
                  v-if="operator.status === 'Active'"
                  @click="cambiarEstado(operator.id, 'Inactive')"
                  class="btn-icon warning"
                  title="Desactivar"
                >
                  ⏸️
                </button>
                <button
                  v-if="operator.status === 'Inactive'"
                  @click="cambiarEstado(operator.id, 'Active')"
                  class="btn-icon success"
                  title="Activar"
                >
                  ✅
                </button>

                <button
                  @click="eliminarOperator(operator.id)"
                  class="btn-icon danger"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <div v-if="operatorsFiltrados.length === 0" class="empty-state">
          <p>No se encontraron operadores</p>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar operador -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ operatorEditar ? 'Editar' : 'Nuevo' }} Operador</h3>
          <button @click="cerrarModal" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="guardarOperator" class="operator-form">
            <div class="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                v-model="formData.fullName"
                required
                placeholder="Juan Pérez García"
                class="form-control"
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Documento *</label>
                <input
                  type="text"
                  v-model="formData.document"
                  required
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
                placeholder="operador@autospace.com"
                class="form-control"
              >
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button @click="cerrarModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="guardarOperator" class="btn btn-primary" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (operatorEditar ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import { operatorsService } from '@/services/api'

export default {
  name: 'Operators',
  setup() {
    const operators = ref([])
    const mostrarModal = ref(false)
    const operatorEditar = ref(null)
    const guardando = ref(false)
    const filtroEstado = ref('')
    const filtroBusqueda = ref('')

    const formData = reactive({
      fullName: '',
      document: '',
      email: '',
      status: 'Active'
    })

    // Cargar operadores
    const cargarOperadores = async () => {
      try {
        const response = await operatorsService.obtenerTodos()
        operators.value = response.data
      } catch (error) {
        console.error('Error cargando operadores:', error)
      }
    }

    // Computed para estadísticas
    const stats = computed(() => {
      const total = operators.value.length
      const activos = operators.value.filter(op => op.status === 'Active').length
      const totalRecaudado = operators.value.reduce((sum, op) => sum + (op.totalCollected || 0), 0)
      return { total, activos, totalRecaudado }
    })

    // Computed para operadores filtrados
    const operatorsFiltrados = computed(() => {
      let filtered = operators.value

      // Filtro por estado
      if (filtroEstado.value) {
        filtered = filtered.filter(op => op.status === filtroEstado.value)
      }

      // Filtro por búsqueda de texto
      if (filtroBusqueda.value) {
        const search = filtroBusqueda.value.toLowerCase()
        filtered = filtered.filter(op =>
          op.fullName.toLowerCase().includes(search) ||
          (op.document && op.document.toLowerCase().includes(search)) ||
          (op.email && op.email.toLowerCase().includes(search))
        )
      }

      return filtered
    })

    const guardarOperator = async () => {
      try {
        guardando.value = true

        if (operatorEditar.value) {
          await operatorsService.actualizar(operatorEditar.value.id, formData)
        } else {
          await operatorsService.crear(formData)
        }

        await cargarOperadores()
        cerrarModal()
      } catch (error) {
        console.error('Error guardando operador:', error)
        alert(error.response?.data?.error || 'Error guardando operador')
      } finally {
        guardando.value = false
      }
    }

    const editarOperator = (operator) => {
      operatorEditar.value = operator
      formData.fullName = operator.fullName
      formData.document = operator.document
      formData.email = operator.email
      formData.status = operator.status
      mostrarModal.value = true
    }

    const cambiarEstado = async (id, nuevoEstado) => {
      const confirmacion = confirm(`¿Está seguro de ${nuevoEstado === 'Active' ? 'activar' : 'desactivar'} este operador?`)
      if (!confirmacion) return

      try {
        await operatorsService.actualizar(id, { status: nuevoEstado })
        await cargarOperadores()
      } catch (error) {
        console.error('Error cambiando estado:', error)
        alert('Error cambiando estado del operador')
      }
    }

    const eliminarOperator = async (id) => {
      const confirmacion = confirm('¿Está seguro de eliminar este operador?')
      if (!confirmacion) return

      try {
        await operatorsService.eliminar(id)
        await cargarOperadores()
      } catch (error) {
        console.error('Error eliminando operador:', error)
        alert('Error eliminando operador')
      }
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      operatorEditar.value = null
      // Reset form
      Object.keys(formData).forEach(key => {
        if (key === 'status') {
          formData[key] = 'Active'
        } else {
          formData[key] = ''
        }
      })
    }

    onMounted(() => {
      cargarOperadores()
    })

    return {
      operators,
      operatorsFiltrados,
      mostrarModal,
      operatorEditar,
      formData,
      guardando,
      filtroEstado,
      filtroBusqueda,
      stats,
      guardarOperator,
      editarOperator,
      cambiarEstado,
      eliminarOperator,
      cerrarModal
    }
  }
}
</script>

<style scoped>
.operators {
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

.btn-icon.warning:hover {
  background: #fff3cd;
}

.btn-icon.success:hover {
  background: #d4edda;
}

.btn-icon.danger:hover {
  background: #f8d7da;
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

.operator-form {
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

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-actions {
    flex-direction: column;
  }

  .modal-content {
    margin: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
