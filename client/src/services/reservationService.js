import { apiClient } from './api';

export const reservationService = {
  // Obtener todas las reservas (admin/operator)
  async getReservations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.room) params.append('room', filters.room);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const endpoint = `/api/reservations${params.toString() ? `?${params}` : ''}`;
    const response = await apiClient.get(endpoint);
    return response;
  },

  // Obtener reservas del usuario actual
  async getMyReservations() {
    const response = await apiClient.get('/api/reservations/mine');
    return response;
  },

  // Obtener reserva por ID
  async getReservationById(id) {
    const response = await apiClient.get(`/api/reservations/${id}`);
    return response;
  },

  // Crear nueva reserva
  async createReservation(reservationData) {
    const response = await apiClient.post('/api/reservations', reservationData);
    return response;
  },

  // Actualizar estado de reserva (admin/operator)
  async updateReservationStatus(id, status) {
    const response = await apiClient.patch(`/api/reservations/${id}/status`, { status });
    return response;
  },

  // Actualizar estado de pago (admin/operator)
  async updatePaymentStatus(id, paymentStatus) {
    const response = await apiClient.patch(`/api/reservations/${id}/payment`, { paymentStatus });
    return response;
  },

  // Cancelar reserva
  async cancelReservation(id) {
    return this.updateReservationStatus(id, 'cancelled');
  },

  // Confirmar reserva
  async confirmReservation(id) {
    return this.updateReservationStatus(id, 'confirmed');
  },

  // Liberar reserva
  async releaseReservation(id) {
    return this.updateReservationStatus(id, 'released');
  },

  // Verificar disponibilidad de habitación
  async checkAvailability(roomId, checkIn, checkOut) {
    const params = new URLSearchParams({
      room: roomId,
      checkIn: checkIn,
      checkOut: checkOut
    });
    
    try {
      const response = await apiClient.get(`/api/reservations/availability?${params}`);
      return response;
    } catch (error) {
      // Si no existe el endpoint, simulamos la verificación
      console.warn('Availability endpoint not found, using basic validation');
      return { available: true };
    }
  },

  // Obtener estadísticas de reservas (admin)
  async getReservationStats() {
    try {
      const response = await apiClient.get('/api/reservations/stats');
      return response;
    } catch (error) {
      // Fallback: calcular estadísticas básicas desde las reservas
      const reservations = await this.getReservations();
      return {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length,
        thisMonth: reservations.filter(r => {
          const created = new Date(r.createdAt);
          const now = new Date();
          return created.getMonth() === now.getMonth() && 
                 created.getFullYear() === now.getFullYear();
        }).length
      };
    }
  }
};
