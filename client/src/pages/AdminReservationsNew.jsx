import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const roomTypeNames = {
  estandar: 'Estándar',
  lujo: 'Lujo',
  familiar: 'Familiar',
  presidencial: 'Presidencial',
  cordillera: 'Cordillera'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200'
}

const paymentColors = {
  pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function AdminReservationsNew() {
  const [reservations, setReservations] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [resData, roomsData] = await Promise.all([
        api.getAllReservations(),
        api.getRooms()
      ])
      setReservations(resData)
      setRooms(roomsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (reservationId, roomId = null) => {
    try {
      await api.checkIn(reservationId, roomId)
      await loadData()
      alert('Check-in realizado exitosamente')
    } catch (error) {
      alert('Error al hacer check-in: ' + error.message)
    }
  }

  const handleCheckOut = async (reservationId) => {
    if (!confirm('¿Confirmar check-out? La habitación se marcará para limpieza.')) return
    
    try {
      await api.checkOut(reservationId)
      await loadData()
      alert('Check-out realizado exitosamente')
    } catch (error) {
      alert('Error al hacer check-out: ' + error.message)
    }
  }

  const openAssignModal = (reservation) => {
    setSelectedReservation(reservation)
    const available = rooms.filter(r => 
      r.type === reservation.roomType && 
      r.status === 'disponible'
    )
    setAvailableRooms(available)
    setShowAssignModal(true)
  }

  const handleAssignRoom = async (roomId) => {
    try {
      await api.assignRoom(selectedReservation.id, roomId)
      await loadData()
      setShowAssignModal(false)
      alert('Habitación asignada exitosamente')
    } catch (error) {
      alert('Error al asignar habitación: ' + error.message)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.updateReservationStatus(id, status)
      await loadData()
    } catch (error) {
      alert('Error al actualizar estado: ' + error.message)
    }
  }

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await api.updatePaymentStatus(id, paymentStatus)
      await loadData()
    } catch (error) {
      alert('Error al actualizar pago: ' + error.message)
    }
  }

  const filteredReservations = reservations.filter(res => {
    if (filter === 'all') return true
    if (filter === 'unassigned') return !res.roomId
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      const checkIn = new Date(res.checkIn).toISOString().split('T')[0]
      return checkIn === today
    }
    return res.status === filter
  })

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    unassigned: reservations.filter(r => !r.roomId && r.status !== 'cancelled').length,
    today: reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0]
      const checkIn = new Date(r.checkIn).toISOString().split('T')[0]
      return checkIn === today
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-stone/70">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone/5 to-gold/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display text-gradient mb-2">Gestión de Reservas</h1>
          <p className="text-stone/70">Check-in, check-out y asignación de habitaciones</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card-luxury p-4">
            <div className="text-2xl font-bold text-stone mb-1">{stats.total}</div>
            <div className="text-xs text-stone/60">Total Reservas</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
            <div className="text-xs text-stone/60">Pendientes</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.confirmed}</div>
            <div className="text-xs text-stone/60">Confirmadas</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600 mb-1">{stats.unassigned}</div>
            <div className="text-xs text-stone/60">Sin Asignar</div>
          </div>
          <div className="card-luxury p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.today}</div>
            <div className="text-xs text-stone/60">Check-in Hoy</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-luxury p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all' ? 'bg-gradient-to-r from-gold to-copper text-white' : 'bg-stone/10 text-stone hover:bg-stone/20'
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'today' ? 'bg-blue-500 text-white' : 'bg-stone/10 text-stone hover:bg-stone/20'
              }`}
            >
              Check-in Hoy ({stats.today})
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'unassigned' ? 'bg-orange-500 text-white' : 'bg-stone/10 text-stone hover:bg-stone/20'
              }`}
            >
              Sin Asignar ({stats.unassigned})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-stone/10 text-stone hover:bg-stone/20'
              }`}
            >
              Pendientes ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'confirmed' ? 'bg-green-500 text-white' : 'bg-stone/10 text-stone hover:bg-stone/20'
              }`}
            >
              Confirmadas ({stats.confirmed})
            </button>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="card-luxury overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Tipo Habitación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Habitación Asignada</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Fechas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Pago</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone/70">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-stone/5 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-stone/60">
                      #{res.id.slice(-6)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone">{res.name}</div>
                      <div className="text-xs text-stone/60">{res.email}</div>
                      {res.phone && <div className="text-xs text-stone/60">{res.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium capitalize">{roomTypeNames[res.roomType]}</span>
                      <div className="text-xs text-stone/60">{res.people} personas</div>
                    </td>
                    <td className="px-4 py-3">
                      {res.room ? (
                        <div>
                          <div className="font-medium text-stone">{res.room.name}</div>
                          <div className="text-xs text-stone/60">#{res.room.roomNumber}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-orange-600 font-medium">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{new Date(res.checkIn).toLocaleDateString()}</div>
                      <div className="text-xs text-stone/60">→ {new Date(res.checkOut).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={res.status}
                        onChange={(e) => updateStatus(res.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border ${statusColors[res.status]}`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="completed">Completada</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={res.paymentStatus}
                        onChange={(e) => updatePaymentStatus(res.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg ${paymentColors[res.paymentStatus]}`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="refunded">Reembolsado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {!res.roomId && res.status !== 'cancelled' && (
                          <button
                            onClick={() => openAssignModal(res)}
                            className="text-xs px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            🏨 Asignar
                          </button>
                        )}
                        
                        {res.roomId && res.status === 'pending' && (
                          <button
                            onClick={() => handleCheckIn(res.id)}
                            className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            ✓ Check-in
                          </button>
                        )}
                        
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => handleCheckOut(res.id)}
                            className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            → Check-out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Room Modal */}
        {showAssignModal && selectedReservation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display text-stone">
                    Asignar Habitación
                  </h2>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-stone/50 hover:text-stone"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-stone/5 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-stone mb-2">Reserva #{selectedReservation.id.slice(-6)}</h3>
                  <div className="text-sm text-stone/70 space-y-1">
                    <p><strong>Cliente:</strong> {selectedReservation.name}</p>
                    <p><strong>Tipo solicitado:</strong> {roomTypeNames[selectedReservation.roomType]}</p>
                    <p><strong>Fechas:</strong> {new Date(selectedReservation.checkIn).toLocaleDateString()} - {new Date(selectedReservation.checkOut).toLocaleDateString()}</p>
                    <p><strong>Personas:</strong> {selectedReservation.people}</p>
                    {selectedReservation.specialRequests && (
                      <p><strong>Solicitudes:</strong> {selectedReservation.specialRequests}</p>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-stone mb-4">
                  Habitaciones Disponibles ({availableRooms.length})
                </h3>

                {availableRooms.length === 0 ? (
                  <div className="text-center py-8 text-stone/60">
                    <p>No hay habitaciones tipo {roomTypeNames[selectedReservation.roomType]} disponibles</p>
                    <button
                      onClick={() => handleCheckIn(selectedReservation.id)}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-gold to-copper text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Asignar Automáticamente
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableRooms.map((room) => (
                      <div
                        key={room.id}
                        className="border border-stone/20 rounded-lg p-4 hover:border-gold hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => handleAssignRoom(room.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-stone">{room.name}</h4>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Disponible
                          </span>
                        </div>
                        <div className="text-sm text-stone/70 space-y-1">
                          <p>🏨 Habitación #{room.roomNumber}</p>
                          <p>🏢 Piso {room.floor}</p>
                          <p>👁️ Vista: {room.view}</p>
                          <p className="font-medium text-gold">${room.price}/noche</p>
                        </div>
                        <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-gold to-copper text-white rounded-lg hover:shadow-lg transition-all">
                          Asignar esta habitación
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
