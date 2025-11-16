import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { reservationService } from '../services/reservationService'

export default function Account() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    reservationService.getMyReservations()
      .then((res) => { if (mounted) setItems(res) })
      .catch((e) => { if (mounted) setError(e.message || 'No se pudieron cargar las reservas') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'released': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada'
      case 'pending': return 'Pendiente'
      case 'cancelled': return 'Cancelada'
      case 'released': return 'Liberada'
      default: return status
    }
  }

  const getPaymentColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'unpaid': return 'bg-orange-100 text-orange-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentText = (status) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'unpaid': return 'Pendiente de pago'
      case 'refunded': return 'Reembolsado'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone/5 to-gold/5 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display text-stone mb-2">Mi Cuenta</h1>
          <p className="text-stone/70">Gestiona tu perfil y reservas en Hotel Supay</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card-luxury p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gold/20 to-copper/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gold">👤</span>
              </div>
              <h2 className="font-display text-xl text-stone mb-2">{user?.name}</h2>
              <p className="text-stone/70 mb-4">{user?.email}</p>
              <div className="space-y-3">
                <Link 
                  to="/reservas" 
                  className="btn-cta w-full py-2 text-sm rounded-lg"
                >
                  Nueva Reserva
                </Link>
                <Link 
                  to="/habitaciones" 
                  className="btn-outline w-full py-2 text-sm rounded-lg"
                >
                  Ver Suites
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card-luxury p-6 mt-6">
              <h3 className="font-display text-lg text-stone mb-4">Resumen</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone/70">Total reservas:</span>
                  <span className="font-medium text-stone">{items.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone/70">Confirmadas:</span>
                  <span className="font-medium text-green-600">
                    {items.filter(r => r.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone/70">Pendientes:</span>
                  <span className="font-medium text-yellow-600">
                    {items.filter(r => r.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reservations */}
          <div className="lg:col-span-2">
            <div className="card-luxury p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display text-stone">Mis Reservas</h2>
                <Link 
                  to="/reservas" 
                  className="text-gold hover:text-copper text-sm font-medium"
                >
                  Nueva reserva →
                </Link>
              </div>

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
                  <p className="mt-4 text-stone/70">Cargando reservas...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {!loading && !error && items.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏨</div>
                  <h3 className="text-xl font-display text-stone mb-2">No tienes reservas aún</h3>
                  <p className="text-stone/70 mb-6">
                    Descubre nuestras exclusivas suites y experiencias únicas en el NOA
                  </p>
                  <Link 
                    to="/habitaciones" 
                    className="btn-cta px-6 py-3 rounded-lg"
                  >
                    Explorar Suites
                  </Link>
                </div>
              )}

              <div className="space-y-4">
                {items.map((reservation) => (
                  <div key={reservation._id} className="border border-stone/10 rounded-lg p-6 hover:bg-stone/5 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-stone mb-2">
                          {reservation.room?.name || 'Habitación'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-stone/70">
                          <div>
                            <span className="font-medium">Check-in:</span>
                            <br />
                            {new Date(reservation.checkIn).toLocaleDateString('es-AR', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div>
                            <span className="font-medium">Check-out:</span>
                            <br />
                            {new Date(reservation.checkOut).toLocaleDateString('es-AR', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-stone/70">
                          <span className="font-medium">Huéspedes:</span> {reservation.people} persona{reservation.people > 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 md:items-end">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentColor(reservation.paymentStatus)}`}>
                          {getPaymentText(reservation.paymentStatus)}
                        </span>
                        <div className="text-xs text-stone/50 mt-1">
                          Reservado: {new Date(reservation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
