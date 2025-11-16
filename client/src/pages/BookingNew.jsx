import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const roomTypes = {
  estandar: {
    name: 'Habitación Estándar',
    description: 'Perfecta para parejas y viajeros individuales',
    features: ['Vista a jardines o lateral', 'WiFi', 'TV LED 42"', 'Minibar', 'Baño privado'],
    capacity: '2-3 personas',
    image: '/images/Habitacion Estandar.webp'
  },
  lujo: {
    name: 'Habitación de Lujo',
    description: 'Vista panorámica a la cordillera con balcón privado',
    features: ['Balcón con jacuzzi', 'TV Smart 55"', 'Minibar premium', 'Nespresso', 'Bata y pantuflas'],
    capacity: '2-3 personas',
    image: '/images/Habitacion de lujo.webp'
  },
  familiar: {
    name: 'Suite Familiar',
    description: 'Dos habitaciones conectadas, ideal para familias',
    features: ['2 habitaciones', '2 baños', 'Sala de estar', 'Cocina pequeña', 'Juegos'],
    capacity: '4-6 personas',
    image: '/images/Habitacion Familiar.webp'
  },
  presidencial: {
    name: 'Suite Presidencial',
    description: 'Máximo lujo con servicio de mayordomo incluido',
    features: ['Terraza privada', 'Jacuzzi panorámico', 'Mayordomo 24/7', 'Chef privado', 'Traslado incluido'],
    capacity: '2-4 personas',
    image: '/images/Suite Presidencial.webp'
  },
  cordillera: {
    name: 'Suite Cordillera',
    description: 'La suite más exclusiva con vista 360° y piscina privada',
    features: ['Vista 360°', 'Piscina infinity privada', 'Terraza 80m²', 'Gimnasio privado', 'Experiencia VIP completa'],
    capacity: '2-4 personas',
    image: '/images/Suite Presidencial.webp'
  }
}

export default function BookingNew() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Fechas, 2: Tipo, 3: Datos, 4: Confirmación
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [availability, setAvailability] = useState(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [people, setPeople] = useState(2)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const minDate = new Date().toISOString().split('T')[0]

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) {
      setError('Por favor selecciona las fechas')
      return
    }

    try {
      setLoadingAvailability(true)
      setError('')
      const data = await api.checkAvailability(checkIn, checkOut)
      setAvailability(data)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingAvailability(false)
    }
  }

  const selectRoomType = (type) => {
    setSelectedType(type)
    setStep(3)
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!selectedType || !availability) return 0
    const nights = calculateNights()
    return availability[selectedType]?.price * nights
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError('')
      
      await api.createReservation({
        roomType: selectedType,
        checkIn,
        checkOut,
        people,
        ...formData
      })
      
      setSuccess(true)
      setStep(4)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setCheckIn('')
    setCheckOut('')
    setAvailability(null)
    setSelectedType(null)
    setPeople(2)
    setFormData({ name: '', email: '', phone: '', specialRequests: '' })
    setSuccess(false)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone/5 to-gold/5 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display text-gradient mb-4">Reserva tu Estadía</h1>
          <p className="text-xl text-stone/70">Elige el tipo de habitación perfecto para tu experiencia</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-gold' : 'text-stone/30'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-gradient-to-r from-gold to-copper text-white' : 'bg-stone/10'}`}>
                1
              </div>
              <span className="hidden sm:inline">Fechas</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-gold' : 'bg-stone/20'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-gold' : 'text-stone/30'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-gradient-to-r from-gold to-copper text-white' : 'bg-stone/10'}`}>
                2
              </div>
              <span className="hidden sm:inline">Tipo</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-gold' : 'bg-stone/20'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-gold' : 'text-stone/30'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-gradient-to-r from-gold to-copper text-white' : 'bg-stone/10'}`}>
                3
              </div>
              <span className="hidden sm:inline">Datos</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 4 ? 'bg-gold' : 'bg-stone/20'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 4 ? 'text-gold' : 'text-stone/30'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 4 ? 'bg-gradient-to-r from-gold to-copper text-white' : 'bg-stone/10'}`}>
                ✓
              </div>
              <span className="hidden sm:inline">Listo</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* STEP 1: Seleccionar Fechas */}
        {step === 1 && (
          <div className="card-luxury p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-display text-stone mb-6">Selecciona tus fechas</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone mb-2">Fecha de entrada</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={minDate}
                  className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone mb-2">Fecha de salida</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || minDate}
                  className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone mb-2">Número de personas</label>
                <select
                  value={people}
                  onChange={(e) => setPeople(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>

              {checkIn && checkOut && (
                <div className="p-4 bg-gold/10 rounded-lg">
                  <p className="text-stone/70">
                    <strong>{calculateNights()}</strong> {calculateNights() === 1 ? 'noche' : 'noches'}
                  </p>
                </div>
              )}

              <button
                onClick={checkAvailability}
                disabled={!checkIn || !checkOut || loadingAvailability}
                className="w-full btn-cta py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAvailability ? 'Verificando disponibilidad...' : 'Ver habitaciones disponibles'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Seleccionar Tipo de Habitación */}
        {step === 2 && availability && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-6 text-stone/70 hover:text-gold flex items-center gap-2"
            >
              ← Cambiar fechas
            </button>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(roomTypes).map(([type, info]) => {
                const avail = availability[type]
                const isAvailable = avail && avail.available > 0
                const nights = calculateNights()
                const totalPrice = avail?.price * nights

                return (
                  <div
                    key={type}
                    className={`card-luxury overflow-hidden ${isAvailable ? 'hover-lift cursor-pointer' : 'opacity-60'}`}
                    onClick={() => isAvailable && selectRoomType(type)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={info.image} 
                        alt={info.name}
                        className="w-full h-full object-cover"
                      />
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold">No Disponible</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-display text-stone mb-2">{info.name}</h3>
                      <p className="text-sm text-stone/70 mb-4">{info.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-stone/60">
                          <span>👥</span>
                          <span>{info.capacity}</span>
                        </div>
                        {info.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-stone/60">
                            <span>✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {isAvailable && (
                        <>
                          <div className="border-t border-stone/10 pt-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-stone/60">Precio por noche</span>
                              <span className="font-bold text-stone">${avail.price}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-stone/60">{nights} {nights === 1 ? 'noche' : 'noches'}</span>
                              <span className="text-sm text-stone/60">x {nights}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span className="text-gold">Total</span>
                              <span className="text-gold">${totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="text-sm text-green-600 mb-4">
                            ✓ {avail.available} {avail.available === 1 ? 'habitación disponible' : 'habitaciones disponibles'}
                          </div>

                          <button className="w-full btn-cta">
                            Seleccionar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Datos del Cliente */}
        {step === 3 && selectedType && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep(2)}
              className="mb-6 text-stone/70 hover:text-gold flex items-center gap-2"
            >
              ← Cambiar tipo de habitación
            </button>

            <div className="card-luxury p-8">
              <h2 className="text-2xl font-display text-stone mb-6">Completa tus datos</h2>

              {/* Resumen */}
              <div className="bg-gold/10 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-stone mb-2">{roomTypes[selectedType].name}</h3>
                <div className="text-sm text-stone/70 space-y-1">
                  <p>📅 {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}</p>
                  <p>🌙 {calculateNights()} {calculateNights() === 1 ? 'noche' : 'noches'}</p>
                  <p>👥 {people} {people === 1 ? 'persona' : 'personas'}</p>
                  <p className="text-lg font-bold text-gold mt-2">Total: ${calculateTotal().toFixed(2)}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone mb-2">Nombre completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone mb-2">Solicitudes especiales</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Ej: Piso alto, vista a la cordillera, cama king..."
                    rows="3"
                    className="w-full px-4 py-3 border border-stone/20 rounded-lg focus:ring-2 focus:ring-gold/50 resize-none"
                  />
                  <p className="text-xs text-stone/50 mt-1">Haremos nuestro mejor esfuerzo para cumplir tus solicitudes</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 border border-stone/20 rounded-lg hover:bg-stone/5 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-cta py-3 disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmación */}
        {step === 4 && success && (
          <div className="max-w-2xl mx-auto">
            <div className="card-luxury p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-3xl font-display text-gradient mb-4">¡Reserva Confirmada!</h2>
              <p className="text-stone/70 mb-6">
                Hemos recibido tu solicitud de reserva. Te enviaremos un email de confirmación con todos los detalles.
              </p>

              <div className="bg-stone/5 p-6 rounded-lg mb-6 text-left">
                <h3 className="font-bold text-stone mb-3">Resumen de tu reserva:</h3>
                <div className="space-y-2 text-sm text-stone/70">
                  <p><strong>Tipo:</strong> {roomTypes[selectedType].name}</p>
                  <p><strong>Fechas:</strong> {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}</p>
                  <p><strong>Noches:</strong> {calculateNights()}</p>
                  <p><strong>Personas:</strong> {people}</p>
                  <p className="text-lg font-bold text-gold pt-2"><strong>Total:</strong> ${calculateTotal().toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-sm text-blue-800">
                <p className="font-medium mb-2">📋 Próximos pasos:</p>
                <ul className="text-left space-y-1 ml-4">
                  <li>• Recibirás un email de confirmación</li>
                  <li>• La habitación específica se asignará al hacer check-in</li>
                  <li>• Puedes ver tus reservas en "Mi Cuenta"</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetForm}
                  className="flex-1 btn-outline py-3"
                >
                  Nueva Reserva
                </button>
                <button
                  onClick={() => navigate('/mi-cuenta')}
                  className="flex-1 btn-cta py-3"
                >
                  Ver Mis Reservas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
