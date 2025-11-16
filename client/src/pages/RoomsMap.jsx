import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const RoomsMap = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, disponible, ocupada, mantenimiento
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (user?.role === 'operator' || user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, reservationsData] = await Promise.all([
        api.getRooms(),
        api.getAllReservations()
      ]);
      setRooms(roomsData);
      setReservations(reservationsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      disponible: 'bg-green-500',
      ocupada: 'bg-red-500',
      mantenimiento: 'bg-yellow-500',
      fuera_de_servicio: 'bg-gray-500',
      limpieza: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusText = (status) => {
    const texts = {
      disponible: 'Disponible',
      ocupada: 'Ocupada',
      mantenimiento: 'Mantenimiento',
      fuera_de_servicio: 'Fuera de Servicio',
      limpieza: 'En Limpieza'
    };
    return texts[status] || status;
  };

  const getTypeIcon = (type) => {
    const icons = {
      estandar: '🛏️',
      lujo: '✨',
      familiar: '👨‍👩‍👧‍👦',
      presidencial: '👑',
      cordillera: '🏔️'
    };
    return icons[type] || '🏨';
  };

  const getCurrentReservation = (roomId) => {
    const today = new Date();
    return reservations.find(r => 
      r.roomId === roomId && 
      r.status === 'confirmed' &&
      new Date(r.checkIn) <= today &&
      new Date(r.checkOut) >= today
    );
  };

  const filteredRooms = rooms.filter(room => {
    if (filterStatus !== 'all' && room.status !== filterStatus) return false;
    if (filterType !== 'all' && room.type !== filterType) return false;
    return true;
  });

  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const floor = room.floor || 1;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await api.updateRoom(roomId, { status: newStatus });
      loadData();
      setSelectedRoom(null);
    } catch (err) {
      console.error('Error updating room status:', err);
      alert('Error al actualizar el estado de la habitación');
    }
  };

  if (user?.role !== 'operator' && user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-display text-stone mb-4">Acceso Denegado</h1>
          <p className="text-stone/70">Solo operadores y administradores pueden acceder al mapa.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display text-stone mb-2">
          Mapa de Habitaciones
        </h1>
        <p className="text-stone/70">
          Vista en tiempo real del estado de todas las habitaciones - Hotel Supay
        </p>
      </div>

      {/* Filters and Legend */}
      <div className="card-luxury p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="all">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="limpieza">En Limpieza</option>
              <option value="fuera_de_servicio">Fuera de Servicio</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="all">Todos los tipos</option>
              <option value="estandar">Estándar</option>
              <option value="lujo">Lujo</option>
              <option value="familiar">Familiar</option>
              <option value="presidencial">Presidencial</option>
              <option value="cordillera">Cordillera</option>
            </select>
          </div>

          <button onClick={loadData} className="btn-outline">
            🔄 Actualizar
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>Mantenimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>En Limpieza</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500"></div>
            <span>Fuera de Servicio</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-luxury p-4 text-center">
          <p className="text-2xl font-bold text-stone">{rooms.length}</p>
          <p className="text-sm text-stone/70">Total</p>
        </div>
        <div className="card-luxury p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {rooms.filter(r => r.status === 'disponible').length}
          </p>
          <p className="text-sm text-stone/70">Disponibles</p>
        </div>
        <div className="card-luxury p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {rooms.filter(r => r.status === 'ocupada').length}
          </p>
          <p className="text-sm text-stone/70">Ocupadas</p>
        </div>
        <div className="card-luxury p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {rooms.filter(r => r.status === 'mantenimiento').length}
          </p>
          <p className="text-sm text-stone/70">Mantenimiento</p>
        </div>
        <div className="card-luxury p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {rooms.filter(r => r.status === 'limpieza').length}
          </p>
          <p className="text-sm text-stone/70">Limpieza</p>
        </div>
      </div>

      {/* Rooms by Floor */}
      {Object.keys(groupedRooms).sort((a, b) => b - a).map(floor => (
        <div key={floor} className="card-luxury p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display text-stone">
              🏢 Piso {floor}
            </h2>
            <div className="text-sm text-stone/70">
              {groupedRooms[floor].length} habitaciones
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {groupedRooms[floor].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)).map(room => {
              const reservation = getCurrentReservation(room.id);
              return (
                <div
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    hover:shadow-lg hover:scale-105
                    ${selectedRoom?.id === room.id ? 'ring-2 ring-gold' : ''}
                  `}
                  style={{
                    borderColor: room.status === 'disponible' ? '#10b981' :
                                 room.status === 'ocupada' ? '#ef4444' :
                                 room.status === 'mantenimiento' ? '#f59e0b' :
                                 room.status === 'limpieza' ? '#3b82f6' : '#6b7280'
                  }}
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(room.status)}`}></div>
                  
                  {/* Room Info */}
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getTypeIcon(room.type)}</div>
                    <p className="font-bold text-lg text-stone">{room.number}</p>
                    <p className="text-xs text-stone/70 capitalize">{room.type}</p>
                    <p className="text-xs text-stone/60 mt-1">{getStatusText(room.status)}</p>
                    {reservation && (
                      <p className="text-xs text-red-600 mt-1 font-semibold">
                        {reservation.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-display text-stone mb-2">
                    {getTypeIcon(selectedRoom.type)} Habitación {selectedRoom.number}
                  </h2>
                  <p className="text-stone/70 capitalize">
                    {selectedRoom.type} - Piso {selectedRoom.floor}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-stone/50 hover:text-stone text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Status */}
              <div className="mb-6">
                <p className="text-sm text-stone/70 mb-2">Estado Actual:</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(selectedRoom.status)} text-white`}>
                  {getStatusText(selectedRoom.status)}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-stone/70">Número</p>
                  <p className="text-lg font-semibold">{selectedRoom.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-stone/70">Capacidad</p>
                  <p className="text-lg font-semibold">{selectedRoom.capacity} pers.</p>
                </div>
                <div>
                  <p className="text-sm text-stone/70">Precio/noche</p>
                  <p className="text-lg font-semibold">${selectedRoom.price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-stone/70">Vista</p>
                  <p className="text-lg font-semibold capitalize">{selectedRoom.view}</p>
                </div>
              </div>

              {/* Current Reservation */}
              {(() => {
                const currentRes = getCurrentReservation(selectedRoom.id);
                if (currentRes) {
                  return (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="font-semibold text-red-800 mb-2">Reserva Actual:</p>
                      <div className="text-sm space-y-1">
                        <p><strong>Cliente:</strong> {currentRes.name}</p>
                        <p><strong>Email:</strong> {currentRes.email}</p>
                        <p><strong>Check-in:</strong> {format(new Date(currentRes.checkIn), 'dd/MM/yyyy', { locale: es })}</p>
                        <p><strong>Check-out:</strong> {format(new Date(currentRes.checkOut), 'dd/MM/yyyy', { locale: es })}</p>
                        <p><strong>Personas:</strong> {currentRes.people}</p>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Change Status */}
              <div className="mb-6">
                <p className="text-sm text-stone/70 mb-2">Cambiar Estado:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedRoom.id, 'disponible')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Disponible
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRoom.id, 'ocupada')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Ocupada
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRoom.id, 'limpieza')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    En Limpieza
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRoom.id, 'mantenimiento')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Mantenimiento
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRoom.id, 'fuera_de_servicio')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Fuera de Servicio
                  </button>
                </div>
              </div>

              {/* Description */}
              {selectedRoom.description && (
                <div>
                  <p className="text-sm text-stone/70 mb-2">Descripción:</p>
                  <p className="text-stone">{selectedRoom.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsMap;
