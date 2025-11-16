const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

async function request(path, options = {}) {
  let authHeader = {}
  try {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const { token } = JSON.parse(stored)
      if (token) authHeader = { Authorization: `Bearer ${token}` }
    }
  } catch (err) {
    console.warn('Error parsing auth from localStorage:', err)
  }
  
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader, ...(options.headers || {}) },
      ...options,
    });
    
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();
    
    if (!res.ok) {
      const message = typeof data === 'string' ? data : data?.error || data?.message || 'Error en la solicitud';
      throw new Error(message);
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    }
    throw err;
  }
}

const api = {
  // Rooms
  getRooms: () => request('/api/rooms'),
  getRoom: (id) => request(`/api/rooms/${id}`),
  checkAvailability: (checkIn, checkOut, roomType) => {
    const params = new URLSearchParams({ checkIn, checkOut });
    if (roomType) params.append('roomType', roomType);
    return request(`/api/rooms/availability/check?${params}`);
  },
  createRoom: (payload) => request('/api/rooms', { method: 'POST', body: JSON.stringify(payload) }),
  updateRoom: (id, payload) => request(`/api/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteRoom: (id) => request(`/api/rooms/${id}`, { method: 'DELETE' }),
  
  // Reservations
  createReservation: (payload) => request('/api/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  getMyReservations: () => request('/api/reservations/mine'),
  getAllReservations: () => request('/api/reservations'),
  updateReservationStatus: (id, status) => request(`/api/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updatePaymentStatus: (id, paymentStatus) => request(`/api/reservations/${id}/payment`, { method: 'PATCH', body: JSON.stringify({ paymentStatus }) }),
  assignRoom: (id, roomId) => request(`/api/reservations/${id}/assign-room`, { method: 'PATCH', body: JSON.stringify({ roomId }) }),
  checkIn: (id, roomId) => request(`/api/reservations/${id}/checkin`, { method: 'POST', body: JSON.stringify({ roomId }) }),
  checkOut: (id) => request(`/api/reservations/${id}/checkout`, { method: 'POST' }),
  
  // Inquiries
  createInquiry: (payload) => request('/api/inquiries', { method: 'POST', body: JSON.stringify(payload) }),
  getAllInquiries: () => request('/api/inquiries'),
  replyInquiry: (id) => request(`/api/inquiries/${id}/reply`, { method: 'PATCH' }),
  
  // Auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Users (admin)
  getAllUsers: () => request('/api/users'),
  createUser: (payload) => request('/api/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) => request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  activateUser: (id) => request(`/api/users/${id}/activate`, { method: 'PATCH' }),
};

export default api;
export { api };
