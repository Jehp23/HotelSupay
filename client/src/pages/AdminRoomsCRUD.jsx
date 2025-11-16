import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const AdminRoomsCRUD = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    type: 'estandar',
    floor: 1,
    price: 14000,
    capacity: 2,
    maxCapacity: 2,
    status: 'disponible',
    cleaningStatus: 'limpia',
    view: 'lateral',
    description: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadRooms();
    }
  }, [user]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Error al cargar habitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      roomNumber: '',
      type: 'estandar',
      floor: 1,
      price: 14000,
      capacity: 2,
      maxCapacity: 2,
      status: 'disponible',
      cleaningStatus: 'limpia',
      view: 'lateral',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setModalMode('edit');
    setSelectedRoom(room);
    setFormData({
      name: room.name || '',
      roomNumber: room.roomNumber || '',
      type: room.type || 'estandar',
      floor: room.floor || 1,
      price: room.price || 14000,
      capacity: room.capacity || 2,
      maxCapacity: room.maxCapacity || 2,
      status: room.status || 'disponible',
      cleaningStatus: room.cleaningStatus || 'limpia',
      view: room.view || 'lateral',
      description: room.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (roomId) => {
    if (!confirm('¿Estás seguro de eliminar esta habitación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.deleteRoom(roomId);
      loadRooms();
      alert('Habitación eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Error al eliminar habitación: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (modalMode === 'create') {
        await api.createRoom(formData);
        alert('Habitación creada exitosamente');
      } else {
        await api.updateRoom(selectedRoom.id, formData);
        alert('Habitación actualizada exitosamente');
      }
      setShowModal(false);
      loadRooms();
    } catch (err) {
      console.error('Error saving room:', err);
      setError(err.message || 'Error al guardar habitación');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'capacity', 'maxCapacity', 'floor'].includes(name) 
        ? parseInt(value) || 0 
        : value
    }));
  };

  // Auto-ajustar precios según tipo
  useEffect(() => {
    const pricesByType = {
      presidencial: 35000,
      cordillera: 28000,
      lujo: 22000,
      familiar: 18000,
      estandar: 14000
    };
    if (formData.type && pricesByType[formData.type]) {
      setFormData(prev => ({ ...prev, price: pricesByType[formData.type] }));
    }
  }, [formData.type]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-display text-stone mb-4">Acceso Denegado</h1>
          <p className="text-stone/70">Solo administradores pueden gestionar habitaciones.</p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display text-stone mb-2">
            CRUD de Habitaciones
          </h1>
          <p className="text-stone/70">
            Crear, leer, actualizar y eliminar habitaciones - Hotel Supay
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary"
        >
          ➕ Nueva Habitación
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
          <p className="text-2xl font-bold text-blue-600">
            {rooms.filter(r => r.status === 'limpieza').length}
          </p>
          <p className="text-sm text-stone/70">Limpieza</p>
        </div>
        <div className="card-luxury p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {rooms.filter(r => r.status === 'mantenimiento').length}
          </p>
          <p className="text-sm text-stone/70">Mantenimiento</p>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="card-luxury p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone/20">
                <th className="text-left py-3 px-4 font-semibold text-stone">Número</th>
                <th className="text-left py-3 px-4 font-semibold text-stone">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-stone">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-stone">Piso</th>
                <th className="text-left py-3 px-4 font-semibold text-stone">Precio</th>
                <th className="text-left py-3 px-4 font-semibold text-stone">Capacidad</th>
                <th className="text-left py-3 px-4 font-semibold text-stone">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-stone">Vista</th>
                <th className="text-right py-3 px-4 font-semibold text-stone">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-stone/70">
                    No hay habitaciones registradas
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="border-b border-stone/10 hover:bg-stone/5">
                    <td className="py-3 px-4 font-mono text-sm">{room.roomNumber}</td>
                    <td className="py-3 px-4">{room.name}</td>
                    <td className="py-3 px-4 capitalize">{room.type}</td>
                    <td className="py-3 px-4">{room.floor}</td>
                    <td className="py-3 px-4">${room.price?.toLocaleString()}</td>
                    <td className="py-3 px-4">{room.capacity}/{room.maxCapacity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        room.status === 'disponible' ? 'bg-green-100 text-green-800' :
                        room.status === 'ocupada' ? 'bg-red-100 text-red-800' :
                        room.status === 'limpieza' ? 'bg-blue-100 text-blue-800' :
                        room.status === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-sm">{room.view}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display text-stone">
                  {modalMode === 'create' ? '➕ Nueva Habitación' : '✏️ Editar Habitación'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-stone/50 hover:text-stone text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Suite Imperial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Número de Habitación *
                    </label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="101"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Tipo *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="estandar">Estándar</option>
                      <option value="familiar">Familiar</option>
                      <option value="lujo">Lujo</option>
                      <option value="cordillera">Cordillera</option>
                      <option value="presidencial">Presidencial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Piso *
                    </label>
                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      required
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Precio/Noche *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Capacidad *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Cap. Máxima *
                    </label>
                    <input
                      type="number"
                      name="maxCapacity"
                      value={formData.maxCapacity}
                      onChange={handleChange}
                      required
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Estado *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="ocupada">Ocupada</option>
                      <option value="limpieza">En Limpieza</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="fuera_de_servicio">Fuera de Servicio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone mb-1">
                      Vista *
                    </label>
                    <select
                      name="view"
                      value={formData.view}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="cordillera">Cordillera</option>
                      <option value="jardin">Jardín</option>
                      <option value="ciudad">Ciudad</option>
                      <option value="lateral">Lateral</option>
                      <option value="interior">Interior</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Descripción de la habitación..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {modalMode === 'create' ? '➕ Crear Habitación' : '💾 Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomsCRUD;
