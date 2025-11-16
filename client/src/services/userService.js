import { apiClient } from './api';

export const userService = {
  // Obtener todos los usuarios (solo admin)
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.active !== undefined && filters.active !== '') params.append('active', filters.active);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/users?${queryString}` : '/api/users';
    const response = await apiClient.get(endpoint);
    return response; // apiClient.get ya devuelve los datos directamente
  },

  // Obtener usuario por ID
  async getUserById(id) {
    const response = await apiClient.get(`/api/users/${id}`);
    return response;
  },

  // Obtener perfil del usuario actual
  async getCurrentUser() {
    const response = await apiClient.get('/api/users/me');
    return response;
  },

  // Crear nuevo usuario (solo admin)
  async createUser(userData) {
    const response = await apiClient.post('/api/users', userData);
    return response;
  },

  // Actualizar usuario
  async updateUser(id, userData) {
    const response = await apiClient.put(`/api/users/${id}`, userData);
    return response;
  },

  // Desactivar usuario (solo admin)
  async deactivateUser(id) {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response;
  },

  // Reactivar usuario (solo admin)
  async activateUser(id) {
    const response = await apiClient.patch(`/api/users/${id}/activate`);
    return response;
  },

  // Cambiar contraseña
  async changePassword(id, newPassword) {
    const response = await apiClient.put(`/api/users/${id}`, { password: newPassword });
    return response;
  }
};
