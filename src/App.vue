<script setup>
import { onErrorCaptured } from 'vue'

// Manejo global de errores
onErrorCaptured((error, component, info) => {
  console.error('Error capturado globalmente:', error)
  console.log('Componente:', component)
  console.log('Info:', info)
  
  // Evita que el error rompa toda la aplicación
  return false
})
</script>

<template>
  <div id="app">
    <!-- Navbar de navegación -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="/">
          🏢 AutoSpace Admin
        </a>
        
        <!-- Botón para móviles -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Menú de navegación -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">
                📊 Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/subscriptions" class="nav-link">
                📅 Mensualidades
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/rates" class="nav-link">
                💰 Tarifas
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/operators" class="nav-link">
                👨‍💼 Operadores
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/users" class="nav-link">
                👥 Usuarios
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/reports" class="nav-link">
                📈 Reportes
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    
    <!-- Contenido principal donde se renderizan las vistas -->
    <main class="container mt-4">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.nav-link {
  font-weight: 500;
  margin: 0 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}
</style>