import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todas')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [maintenanceForm, setMaintenanceForm] = useState({
    type: 'preventivo',
    description: '',
    scheduledDate: '',
    assignedTo: '',
    priority: 'media',
    notes: ''
  })

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const data = await api.getRooms()
      setRooms(data)
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRoomStatus = async (roomId, newStatus) => {
    try {
      await api.updateRoom(roomId, { status: newStatus })
      await loadRooms()
    } catch (error) {
      console.error('Error updating room status:', error)
      alert('Error al actualizar el estado de la habitación')
    }
  }

  const updateCleaningStatus = async (roomId, cleaningStatus) => {
    try {
      await api.updateRoom(roomId, { 
        cleaningStatus,
        lastCleaned: cleaningStatus === 'limpia' ? new Date() : undefined
      })
      await loadRooms()
    } catch (error) {
      console.error('Error updating cleaning status:', error)
      alert('Error al actualizar el estado de limpieza')
    }
  }

  const scheduleMaintenance = async (e) => {
    e.preventDefault()
    if (!selectedRoom) return

    try {
      const maintenance = {
        ...maintenanceForm,
        status: 'pendiente'
      }

      const updatedMaintenance = [
        ...(selectedRoom.maintenanceScheduled || []),
        maintenance
      ]

      await api.updateRoom(selectedRoom._id, {
        maintenanceScheduled: updatedMaintenance,
        status: 'mantenimiento'
      })

      setShowMaintenanceModal(false)
      setMaintenanceForm({
        type: 'preventivo',
        description: '',
        scheduledDate: '',
        assignedTo: '',
        priority: 'media',
        notes: ''
      })
      await loadRooms()
      alert('Mantenimiento programado exitosamente')
    } catch (error) {
      console.error('Error scheduling maintenance:', error)
      alert('Error al programar el mantenimiento')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'disponible': 'bg-green-100 text-green-800 border-green-200',
      'ocupada': 'bg-red-100 text-red-800 border-red-200',
      'limpieza': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'mantenimiento': 'bg-orange-100 text-orange-800 border-orange-200',
      'fuera-de-servicio': 'bg-gray-100 text-gray-800 border-gray-200',
      'reservada': 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getCleaningColor = (status) => {
    const colors = {
      'limpia': 'bg-green-50 text-green-700',
      'sucia': 'bg-red-50 text-red-700',
      'en-proceso': 'bg-yellow-50 text-yellow-700',
      'inspeccion': 'bg-blue-50 text-blue-700'
    }
    return colors[status] || 'bg-gray-50 text-gray-700'
  }

  const filteredRooms = rooms.filter(room => {
    if (filter === 'todas') return true
    return room.status === filter
  })

  const statusStats = {
    total: rooms.length,
    disponible: rooms.filter(r => r.status === 'disponible').length,
    ocupada: rooms.filter(r => r.status === 'ocupada').length,
    limpieza: rooms.filter(r => r.status === 'limpieza').length,
    mantenimiento: rooms.filter(r => r.status === 'mantenimiento').length,
    'fuera-de-servicio': rooms.filter(r => r.status === 'fuera-de-servicio').length,
  }

  const occupancyRate = rooms.length > 0 
    ? ((statusStats.ocupada / rooms.length) * 100).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-stone/70">Cargando habitaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone/5 to-gold/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display text-gradient mb-2">Gestión de Habitaciones</h1>
          <p className="text-stone/70">Control operativo completo del hotel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="card-luxury p-4">
            <div className="text-2xl font-bold text-stone mb-1">{statusStats.total}</div>
            <div className="text-xs text-stone/60">Total Habitaciones</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600 mb-1">{statusStats.disponible}</div>
            <div className="text-xs text-stone/60">Disponibles</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600 mb-1">{statusStats.ocupada}</div>
            <div className="text-xs text-stone/60">Ocupadas</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{statusStats.limpieza}</div>
            <div className="text-xs text-stone/60">En Limpieza</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600 mb-1">{statusStats.mantenimiento}</div>
            <div className="text-xs text-stone/60">Mantenimiento</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-gold">
            <div className="text-2xl font-bold text-gold mb-1">{occupancyRate}%</div>
            <div className="text-xs text-stone/60">Ocupación</div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="card-luxury p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('todas')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'todas'
                    ? 'bg-gradient-to-r from-gold to-copper text-white'
                    : 'bg-stone/10 text-stone hover:bg-stone/20'
                }`}
              >
                Todas ({statusStats.total})
              </button>
              <button
                onClick={() => setFilter('disponible')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'disponible'
                    ? 'bg-green-500 text-white'
                    : 'bg-stone/10 text-stone hover:bg-stone/20'
                }`}
              >
                Disponibles ({statusStats.disponible})
              </button>
              <button
                onClick={() => setFilter('ocupada')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'ocupada'
                    ? 'bg-red-500 text-white'
                    : 'bg-stone/10 text-stone hover:bg-stone/20'
                }`}
              >
                Ocupadas ({statusStats.ocupada})
              </button>
              <button
                onClick={() => setFilter('limpieza')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'limpieza'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-stone/10 text-stone hover:bg-stone/20'
                }`}
              >
                Limpieza ({statusStats.limpieza})
              </button>
              <button
                onClick={() => setFilter('mantenimiento')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'mantenimiento'
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone/10 text-stone hover:bg-stone/20'
                }`}
              >
                Mantenimiento ({statusStats.mantenimiento})
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' ? 'bg-gold text-white' : 'bg-stone/10 text-stone'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-gold text-white' : 'bg-stone/10 text-stone'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <div key={room._id} className="card-luxury overflow-hidden hover-lift transition-all duration-300">
                {/* Room Image */}
                {room.image && (
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={room.image} 
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  {/* Room Info */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-lg text-stone">{room.name}</h3>
                      <span className="text-xs text-stone/60">#{room.roomNumber || room._id.slice(-4)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone/60">
                      <span className="capitalize">{room.type}</span>
                      <span>•</span>
                      <span>${room.price}/noche</span>
                    </div>
                  </div>

                  {/* Cleaning Status */}
                  {room.cleaningStatus && (
                    <div className={`text-xs px-2 py-1 rounded-lg mb-3 ${getCleaningColor(room.cleaningStatus)}`}>
                      🧹 {room.cleaningStatus}
                    </div>
                  )}

                  {/* Current Guest */}
                  {room.currentGuest && (
                    <div className="text-xs text-stone/70 mb-3 p-2 bg-stone/5 rounded-lg">
                      <div className="font-medium">Huésped: {room.currentGuest}</div>
                      {room.checkOutDate && (
                        <div className="text-stone/50">
                          Check-out: {new Date(room.checkOutDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <select
                      value={room.status}
                      onChange={(e) => updateRoomStatus(room._id, e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="ocupada">Ocupada</option>
                      <option value="limpieza">En Limpieza</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="fuera-de-servicio">Fuera de Servicio</option>
                      <option value="reservada">Reservada</option>
                    </select>

                    <select
                      value={room.cleaningStatus || 'limpia'}
                      onChange={(e) => updateCleaningStatus(room._id, e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                    >
                      <option value="limpia">🧹 Limpia</option>
                      <option value="sucia">🧹 Sucia</option>
                      <option value="en-proceso">🧹 En Proceso</option>
                      <option value="inspeccion">🧹 Inspección</option>
                    </select>

                    <button
                      onClick={() => {
                        setSelectedRoom(room)
                        setShowMaintenanceModal(true)
                      }}
                      className="w-full text-xs px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      🔧 Programar Mantenimiento
                    </button>
                  </div>

                  {/* Maintenance Alerts */}
                  {room.maintenanceScheduled && room.maintenanceScheduled.length > 0 && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-xs font-medium text-orange-800 mb-1">
                        Mantenimientos Pendientes: {room.maintenanceScheduled.filter(m => m.status === 'pendiente').length}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-luxury overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Habitación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Limpieza</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Huésped</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {filteredRooms.map((room) => (
                  <tr key={room._id} className="hover:bg-stone/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone">{room.name}</div>
                      <div className="text-xs text-stone/60">#{room.roomNumber || room._id.slice(-4)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{room.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs ${getCleaningColor(room.cleaningStatus || 'limpia')}`}>
                        {room.cleaningStatus || 'limpia'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{room.currentGuest || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium">${room.price}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedRoom(room)
                          setShowMaintenanceModal(true)
                        }}
                        className="text-xs px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        🔧 Mantenimiento
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Maintenance Modal */}
        {showMaintenanceModal && selectedRoom && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display text-stone">
                    Programar Mantenimiento - {selectedRoom.name}
                  </h2>
                  <button
                    onClick={() => setShowMaintenanceModal(false)}
                    className="text-stone/50 hover:text-stone"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={scheduleMaintenance} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone mb-2">Tipo de Mantenimiento</label>
                      <select
                        value={maintenanceForm.type}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })}
                        className="w-full px-4 py-2 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                        required
                      >
                        <option value="preventivo">Preventivo</option>
                        <option value="correctivo">Correctivo</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone mb-2">Prioridad</label>
                      <select
                        value={maintenanceForm.priority}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                        className="w-full px-4 py-2 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                        required
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone mb-2">Descripción</label>
                    <textarea
                      value={maintenanceForm.description}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50 resize-none"
                      rows="3"
                      placeholder="Describe el trabajo a realizar..."
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone mb-2">Fecha Programada</label>
                      <input
                        type="date"
                        value={maintenanceForm.scheduledDate}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduledDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone mb-2">Asignado a</label>
                      <input
                        type="text"
                        value={maintenanceForm.assignedTo}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, assignedTo: e.target.value })}
                        className="w-full px-4 py-2 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                        placeholder="Nombre del técnico"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone mb-2">Notas Adicionales</label>
                    <textarea
                      value={maintenanceForm.notes}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50 resize-none"
                      rows="2"
                      placeholder="Notas opcionales..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowMaintenanceModal(false)}
                      className="flex-1 px-4 py-3 border border-stone/20 rounded-lg hover:bg-stone/5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-gold to-copper text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Programar Mantenimiento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
