import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reservationService } from '../services/reservationService'
import { api } from '../lib/api'

export default function Booking() {
  const [rooms, setRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bookingType, setBookingType] = useState('room') // 'room' or 'experience'

  const experiences = [
    {
      id: 'spa',
      name: 'Spa & Rituales Andinos',
      description: 'Tratamientos exclusivos con productos naturales de la región',
      price: 25000,
      duration: '90-120 min',
      image: '/images/Complejo de piletas.webp',
      category: 'Bienestar'
    },
    {
      id: 'excursion',
      name: 'Excursiones & Aventuras',
      description: 'Explora los paisajes más impresionantes del NOA',
      price: 35000,
      duration: 'Día completo',
      image: '/images/Excursión al Cerro Hornocal.webp',
      category: 'Aventura'
    },
    {
      id: 'gastronomia',
      name: 'Gastronomía de Altura',
      description: 'Menú degustación con sabores auténticos del NOA',
      price: 45000,
      duration: '2-3 horas',
      image: '/images/Restaurante Andino.webp',
      category: 'Gastronomía'
    },
    {
      id: 'casino',
      name: 'Casino del Supay',
      description: 'Entretenimiento nocturno sofisticado',
      price: 0,
      duration: '20:00 - 04:00',
      image: '/images/Casino del Supay.webp',
      category: 'Entretenimiento'
    },
    {
      id: 'eventos',
      name: 'Eventos & Celebraciones',
      description: 'Espacios únicos para celebraciones memorables',
      price: null,
      duration: 'A medida',
      image: '/images/Eventos Interior.webp',
      category: 'Celebraciones'
    },
    {
      id: 'personalizado',
      name: 'Experiencias a Medida',
      description: 'Itinerarios completamente personalizados',
      price: 80000,
      duration: 'Flexible',
      image: '/images/Museo Supay.webp',
      category: 'Exclusivo'
    }
  ]

  const [form, setForm] = useState({
    room: '',
    experience: '',
    name: '',
    email: '',
    checkIn: '',
    checkOut: '',
    people: 2,
    payment: 'credit',
  })

  useEffect(() => {
    let active = true
    setLoadingRooms(true)
    api.getRooms()
      .then((data) => {
        if (!active) return
        setRooms(data)
        setForm((f) => ({ 
          ...f, 
          room: data?.[0]?._id || '',
          experience: experiences[0]?.id || ''
        }))
      })
      .catch(() => setError('No se pudieron cargar las habitaciones'))
      .finally(() => setLoadingRooms(false))
    return () => { active = false }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validación simple en cliente
    if (bookingType === 'room' && !form.room) return setError('Seleccioná una habitación')
    if (bookingType === 'experience' && !form.experience) return setError('Seleccioná una experiencia')
    if (!form.checkIn || !form.checkOut) return setError('Completá las fechas')
    const start = new Date(form.checkIn)
    const end = new Date(form.checkOut)
    if (!(end > start)) return setError('La fecha de salida debe ser posterior a la de entrada')

    try {
      const reservationData = {
        name: form.name,
        email: form.email,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        people: Number(form.people || 1),
      }

      if (bookingType === 'room') {
        reservationData.room = form.room
      } else {
        reservationData.experience = form.experience
      }

      await reservationService.createReservation(reservationData)
      
      const itemName = bookingType === 'room' 
        ? rooms.find(r => r._id === form.room)?.name 
        : experiences.find(e => e.id === form.experience)?.name
      
      setSuccess(`¡${bookingType === 'room' ? 'Reserva' : 'Experiencia'} de ${itemName} enviada exitosamente! Te contactaremos por email para confirmar los detalles.`)
      
      // Reset form
      setForm({
        room: rooms?.[0]?._id || '',
        experience: experiences[0]?.id || '',
        name: '',
        email: '',
        checkIn: '',
        checkOut: '',
        people: 2,
        payment: 'credit',
      })
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ocurrió un error al enviar la reserva')
    }
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const selectedRoom = rooms.find(r => r._id === form.room)
  const selectedExperience = experiences.find(e => e.id === form.experience)
  const selectedItem = bookingType === 'room' ? selectedRoom : selectedExperience
  
  const calculateNights = () => {
    if (!form.checkIn || !form.checkOut) return 0
    const start = new Date(form.checkIn)
    const end = new Date(form.checkOut)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (bookingType === 'room') {
      const nights = calculateNights()
      const price = selectedRoom?.price || 0
      return nights * price
    } else {
      // Para experiencias, el precio es fijo (no depende de noches)
      return selectedExperience?.price || 0
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone/5 via-cream/5 to-gold/5 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-gold/5 to-copper/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-terracotta/5 to-sage/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-copper/3 to-gold/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold/10 to-copper/10 rounded-full mb-6 backdrop-blur-sm border border-gold/20">
            <span className="text-gold text-sm font-medium tracking-wider">✨ EXPERIENCIA EXCLUSIVA</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-display text-gradient mb-6 leading-tight">
            Reserva tu Experiencia
          </h1>
          <p className="text-xl md:text-2xl text-stone/70 max-w-3xl mx-auto leading-relaxed">
            Vive momentos únicos en el corazón del NOA argentino. 
            <span className="block mt-2 text-gold font-medium">Cada suite es una puerta a la tranquilidad.</span>
          </p>
          
          {/* Booking Type Selector */}
          <div className="flex justify-center gap-4 mt-8 mb-6">
            <button
              onClick={() => setBookingType('room')}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                bookingType === 'room'
                  ? 'bg-gradient-to-r from-gold to-copper text-white shadow-lg scale-105'
                  : 'bg-white text-stone border-2 border-stone/20 hover:border-gold/50'
              }`}
            >
              🏨 Habitaciones
            </button>
            <button
              onClick={() => setBookingType('experience')}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                bookingType === 'experience'
                  ? 'bg-gradient-to-r from-gold to-copper text-white shadow-lg scale-105'
                  : 'bg-white text-stone border-2 border-stone/20 hover:border-gold/50'
              }`}
            >
              ✨ Experiencias
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-stone/60">
            <div className="flex items-center gap-2">
              <span className="text-gold">✓</span>
              <span>Cancelación gratuita</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gold">✓</span>
              <span>Confirmación inmediata</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gold">✓</span>
              <span>Mejor precio garantizado</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Booking Form */}
          <div className="card-luxury p-8 hover-lift transition-all duration-500 fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-display text-gradient">Detalles de tu Reserva</h2>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-copper/20 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-lg animate-shake">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-medium mb-1">Error en la reserva</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-lg animate-fadeIn">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">✅</span>
                  <div className="flex-1">
                    <p className="font-display text-lg mb-2">¡Reserva Exitosa!</p>
                    <p className="text-sm mb-3">{success}</p>
                    <Link 
                      to="/mi-cuenta" 
                      className="inline-flex items-center gap-2 text-green-800 hover:text-green-900 font-medium text-sm bg-white px-4 py-2 rounded-lg hover:shadow-md transition-all"
                    >
                      Ver mis reservas <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              {/* Room/Experience Selection */}
              {bookingType === 'room' ? (
                <div className="group">
                  <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                    <span className="text-gold">🏨</span>
                    <span>Selecciona tu Suite</span>
                  </label>
                  <div className="relative">
                    <select 
                      name="room" 
                      value={form.room} 
                      onChange={onChange} 
                      className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                      disabled={loadingRooms}
                      required
                    >
                      {loadingRooms ? (
                        <option>Cargando habitaciones...</option>
                      ) : (
                        rooms.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.name} — ${r.price}/noche
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group">
                  <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                    <span className="text-gold">✨</span>
                    <span>Selecciona tu Experiencia</span>
                  </label>
                  <div className="relative">
                    <select 
                      name="experience" 
                      value={form.experience} 
                      onChange={onChange} 
                      className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                      required
                    >
                      {experiences.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.name} — {exp.price ? `$${exp.price}` : 'Consultar'}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                    <span className="text-gold">👤</span>
                    <span>Nombre completo</span>
                  </label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={onChange} 
                    className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Tu nombre completo"
                    required 
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                    <span className="text-gold">✉️</span>
                    <span>Email</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={onChange} 
                    className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="tu@email.com"
                    required 
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                    <span className="text-gold">📅</span>
                    <span>Check-in</span>
                  </label>
                  <input 
                    type="date" 
                    name="checkIn" 
                    value={form.checkIn} 
                    onChange={onChange} 
                    min={today}
                    className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    required 
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                    <span className="text-gold">📅</span>
                    <span>Check-out</span>
                  </label>
                  <input 
                    type="date" 
                    name="checkOut" 
                    value={form.checkOut} 
                    onChange={onChange} 
                    min={form.checkIn || today}
                    className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    required 
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="group">
                <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                  <span className="text-gold">👥</span>
                  <span>Número de huéspedes</span>
                </label>
                <div className="relative">
                  <select 
                    name="people" 
                    value={form.people} 
                    onChange={onChange} 
                    className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                    required
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>
                        {num} persona{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="group">
                <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                  <span className="text-gold">💳</span>
                  <span>Método de pago preferido</span>
                </label>
                <div className="relative">
                  <select 
                    name="payment" 
                    value={form.payment} 
                    onChange={onChange} 
                    className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <option value="credit">💳 Tarjeta de crédito</option>
                    <option value="debit">💳 Tarjeta de débito</option>
                    <option value="transfer">🏦 Transferencia bancaria</option>
                    <option value="cash">💵 Efectivo al check-in</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-stone/60 mt-2 flex items-center gap-1">
                  <span>🔒</span>
                  <span>El pago se procesará después de confirmar la disponibilidad</span>
                </p>
              </div>

              <button 
                type="submit"
                className="w-full btn-cta py-4 text-lg rounded-xl hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                disabled={loadingRooms}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loadingRooms ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Cargando...</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Reservar Experiencia</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-copper to-gold opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6 fade-in-up stagger-1">
            {/* Selected Item Preview */}
            {selectedItem && (
              <div className="card-luxury overflow-hidden hover-lift transition-all duration-500 border-2 border-transparent hover:border-gold/20">
                {/* Item Image */}
                {selectedItem.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={selectedItem.image} 
                      alt={selectedItem.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-display text-white">{selectedItem.name}</h3>
                      {selectedItem.category && (
                        <span className="text-gold text-xs font-medium">{selectedItem.category}</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-display text-gradient">
                      {bookingType === 'room' ? 'Tu Suite Seleccionada' : 'Tu Experiencia Seleccionada'}
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-copper/20 flex items-center justify-center">
                      <span className="text-xl">{bookingType === 'room' ? '🏨' : '✨'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-stone/70 text-sm leading-relaxed">{selectedItem.description}</p>
                    </div>
                  
                    {bookingType === 'experience' && selectedItem.duration && (
                      <div className="flex items-center gap-2 text-xs text-stone/60 bg-gold/5 px-3 py-2 rounded-lg">
                        <span>🕒</span>
                        <span>Duración: {selectedItem.duration}</span>
                      </div>
                    )}
                  
                    {bookingType === 'room' && selectedItem.amenities && selectedItem.amenities.length > 0 && (
                      <div>
                        <h5 className="font-medium text-stone text-sm mb-2">Amenities incluidos:</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="px-2 py-1 bg-gold/10 text-gold text-xs rounded-full">
                              {amenity}
                            </span>
                          ))}
                          {selectedItem.amenities.length > 4 && (
                            <span className="px-2 py-1 bg-stone/10 text-stone/70 text-xs rounded-full">
                              +{selectedItem.amenities.length - 4} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  
                    <div className="pt-4 border-t border-stone/10">
                      <div className="flex justify-between items-center">
                        <span className="text-stone/70">
                          {bookingType === 'room' ? 'Precio por noche:' : 'Precio:'}
                        </span>
                        <span className="font-medium text-stone">
                          {selectedItem.price ? `$${selectedItem.price}` : 'Consultar'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Summary */}
            <div className="card-luxury p-6 hover-lift transition-all duration-500 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display text-gradient">Resumen de Reserva</h3>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-copper/20 flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone/70">Huéspedes:</span>
                  <span className="text-stone">{form.people} persona{form.people > 1 ? 's' : ''}</span>
                </div>
                
                {form.checkIn && form.checkOut && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-stone/70">Check-in:</span>
                      <span className="text-stone">
                        {new Date(form.checkIn).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone/70">Check-out:</span>
                      <span className="text-stone">
                        {new Date(form.checkOut).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone/70">Noches:</span>
                      <span className="text-stone">{calculateNights()}</span>
                    </div>
                  </>
                )}
                
                {selectedItem && (bookingType === 'room' ? calculateNights() > 0 : true) && (
                  <>
                    <div className="border-t border-stone/10 pt-4 mt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-stone/70">
                          {bookingType === 'room' ? (
                            `$${selectedItem.price} x ${calculateNights()} noche${calculateNights() > 1 ? 's' : ''}`
                          ) : (
                            `${selectedItem.name}`
                          )}
                        </span>
                        <span className="text-stone font-medium">
                          {selectedItem.price ? `$${calculateTotal()}` : 'Consultar'}
                        </span>
                      </div>
                    </div>
                    {selectedItem.price && (
                      <div className="border-t-2 border-gold/20 pt-4 mt-4 bg-gradient-to-r from-gold/5 to-copper/5 -mx-6 px-6 py-4 rounded-b-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-display text-stone">Total:</span>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gradient">${calculateTotal()}</div>
                            <div className="text-xs text-stone/60 mt-1">ARS</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="card-luxury p-6 hover-lift transition-all duration-500 border-2 border-transparent hover:border-gold/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-copper/20 flex items-center justify-center">
                  <span className="text-lg">ℹ️</span>
                </div>
                <h3 className="text-lg font-display text-stone">Información Importante</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-gold/5 to-transparent rounded-lg">
                  <span className="text-gold">🕒</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone">Horarios</p>
                    <p className="text-xs text-stone/70">Check-in: 15:00 hrs • Check-out: 11:00 hrs</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg">
                  <span className="text-green-600">✓</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone">Cancelación flexible</p>
                    <p className="text-xs text-stone/70">Gratuita hasta 48hs antes del check-in</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg">
                  <span className="text-blue-600">⚡</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone">Confirmación rápida</p>
                    <p className="text-xs text-stone/70">Respuesta por email en menos de 24hs</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-stone/10">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gold/10 to-copper/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <span className="text-sm font-medium text-stone">¿Necesitas ayuda?</span>
                  </div>
                  <Link 
                    to="/contacto" 
                    className="text-gold hover:text-copper font-medium text-sm hover:underline transition-all"
                  >
                    Contáctanos →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
