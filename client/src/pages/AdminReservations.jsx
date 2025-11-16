import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/reservationService';
import { useAuth } from '../context/AuthContext';

const AdminReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', room: '' });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadReservations();
  }, [filters]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getReservations(filters);
      setReservations(data);
    } catch (err) {
      setError('Error al cargar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      await reservationService.updateReservationStatus(reservationId, newStatus);
      loadReservations();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar estado');
    }
  };

  const handlePaymentStatusChange = async (reservationId, newPaymentStatus) => {
    try {
      await reservationService.updatePaymentStatus(reservationId, newPaymentStatus);
      loadReservations();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar estado de pago');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'released': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'released': return 'Liberada';
      default: return status;
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-orange-100 text-orange-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentText = (status) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'unpaid': return 'Pendiente';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  const openReservationModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display text-stone mb-2">Gestión de Reservas</h1>
        <p className="text-stone/70">Administra todas las reservas del hotel</p>
      </div>

      {/* Filters */}
      <div className="card-luxury p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-stone mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="released">Liberadas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone mb-1">Habitación</label>
            <select
              value={filters.room}
              onChange={(e) => setFilters({ ...filters, room: e.target.value })}
              className="px-4 py-2 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
            >
              <option value="">Todas las habitaciones</option>
              <option value="suite">Suites</option>
              <option value="deluxe">Deluxe</option>
              <option value="superior">Superior</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadReservations}
              className="btn-outline px-4 py-2 rounded-lg"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-luxury p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {reservations.length}
          </div>
          <div className="text-stone/70">Total Reservas</div>
        </div>
        <div className="card-luxury p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {reservations.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-stone/70">Pendientes</div>
        </div>
        <div className="card-luxury p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {reservations.filter(r => r.status === 'confirmed').length}
          </div>
          <div className="text-stone/70">Confirmadas</div>
        </div>
        <div className="card-luxury p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {reservations.filter(r => r.paymentStatus === 'unpaid').length}
          </div>
          <div className="text-stone/70">Sin Pagar</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Reservations Table */}
      <div className="card-luxury overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-stone/70">Cargando reservas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone uppercase tracking-wider">
                    Huésped
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone uppercase tracking-wider">
                    Habitación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone uppercase tracking-wider">
                    Huéspedes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {reservations.map((reservation) => (
                  <tr key={reservation._id} className="hover:bg-stone/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-stone">{reservation.name}</div>
                        <div className="text-sm text-stone/70">{reservation.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-stone">
                        {reservation.room?.name || 'Habitación'}
                      </div>
                      <div className="text-sm text-stone/70">
                        {reservation.room?.type || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone/70">
                      <div>
                        {new Date(reservation.checkIn).toLocaleDateString('es-AR')}
                      </div>
                      <div>
                        {new Date(reservation.checkOut).toLocaleDateString('es-AR')}
                      </div>
                      <div className="text-xs text-stone/50">
                        {calculateNights(reservation.checkIn, reservation.checkOut)} noche{calculateNights(reservation.checkIn, reservation.checkOut) > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone">
                      {reservation.people}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation._id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(reservation.status)}`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="released">Liberada</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={reservation.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(reservation._id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getPaymentColor(reservation.paymentStatus)}`}
                      >
                        <option value="unpaid">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="refunded">Reembolsado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openReservationModal(reservation)}
                        className="text-gold hover:text-copper mr-3"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-luxury max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-stone">Detalles de Reserva</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone/70 hover:text-stone text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-display text-lg text-stone mb-4">Información del Huésped</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-stone">Nombre</label>
                    <p className="text-stone/70">{selectedReservation.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone">Email</label>
                    <p className="text-stone/70">{selectedReservation.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone">Número de Huéspedes</label>
                    <p className="text-stone/70">{selectedReservation.people}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg text-stone mb-4">Detalles de Estadía</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-stone">Habitación</label>
                    <p className="text-stone/70">{selectedReservation.room?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone">Check-in</label>
                    <p className="text-stone/70">
                      {new Date(selectedReservation.checkIn).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone">Check-out</label>
                    <p className="text-stone/70">
                      {new Date(selectedReservation.checkOut).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone">Noches</label>
                    <p className="text-stone/70">
                      {calculateNights(selectedReservation.checkIn, selectedReservation.checkOut)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stone/10">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone mb-1">Estado de Reserva</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReservation.status)}`}>
                    {getStatusText(selectedReservation.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone mb-1">Estado de Pago</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentColor(selectedReservation.paymentStatus)}`}>
                    {getPaymentText(selectedReservation.paymentStatus)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone mb-1">Fecha de Reserva</label>
                  <p className="text-stone/70 text-sm">
                    {new Date(selectedReservation.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn-outline flex-1 py-2 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;
