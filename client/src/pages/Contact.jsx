import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function Contact() {
  const [searchParams] = useSearchParams()
  const motivo = searchParams.get('motivo')
  const servicio = searchParams.get('servicio')
  const isExperience = motivo === 'experiencia' || motivo === 'experiencia-vip'
  const isVIPExperience = motivo === 'experiencia-vip'
  
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    message: '',
    type: isVIPExperience ? 'experiencia-vip' : 'consulta',
    service: servicio || '',
    guests: '',
    budget: '',
    eventDate: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  useEffect(() => {
    if (isExperience && servicio) {
      const serviceNames = {
        'spa': 'Spa & Rituales Andinos',
        'excursiones': 'Excursiones & Aventuras',
        'gastronomia': 'Gastronomía de Altura',
        'casino': 'Casino del Supay',
        'eventos': 'Eventos & Celebraciones',
        'experiencias': 'Experiencias a Medida',
        'ritual-amanecer': 'Ritual del Amanecer Andino'
      }
      const serviceName = serviceNames[servicio] || servicio
      setForm(f => ({ 
        ...f, 
        message: `Estoy interesado/a en reservar: ${serviceName}.\n\nDetalles adicionales:\n`
      }))
    }
  }, [isExperience, servicio])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name || !form.email || !form.message) {
      return setError('Completá todos los campos')
    }
    setSubmitting(true)
    try {
      await api.createInquiry(form)
      setSuccess('Consulta enviada. Te responderemos a la brevedad.')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setError(err.message || 'No se pudo enviar la consulta')
    } finally {
      setSubmitting(false)
    }
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone/5 via-cream/5 to-gold/5 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          {isExperience && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold/10 to-copper/10 rounded-full mb-6 backdrop-blur-sm border border-gold/20">
              <span className="text-gold text-sm font-medium tracking-wider">✨ RESERVA TU EXPERIENCIA</span>
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-display text-gradient mb-4">
            {isExperience ? 'Reserva tu Experiencia' : 'Contacto'}
          </h1>
          <p className="text-xl text-stone/70 max-w-2xl mx-auto">
            {isExperience 
              ? 'Completa el formulario y nuestro equipo se pondrá en contacto contigo para confirmar tu reserva.'
              : 'Estamos aquí para ayudarte. Envíanos tu consulta y te responderemos a la brevedad.'
            }
          </p>
        </div>

        <div className="card-luxury p-8 md:p-12 fade-in-up stagger-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 shadow-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium mb-1">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-lg">
              <div className="flex items-start gap-3">
                <span className="text-3xl">✅</span>
                <div className="flex-1">
                  <p className="font-display text-lg mb-2">
                    {isExperience ? '¡Reserva Recibida!' : '¡Mensaje Enviado!'}
                  </p>
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            {/* Basic Information */}
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

            {/* Experience Fields */}
            {isExperience && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                      <span className="text-gold">📞</span>
                      <span>Teléfono</span>
                    </label>
                    <input 
                      name="phone" 
                      value={form.phone} 
                      onChange={onChange} 
                      className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="+54 9 ..."
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                      <span className="text-gold">👥</span>
                      <span>Número de personas</span>
                    </label>
                    <input 
                      type="number" 
                      name="guests" 
                      value={form.guests} 
                      onChange={onChange} 
                      min="1"
                      className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Ej: 10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                      <span className="text-gold">📅</span>
                      <span>Fecha tentativa del evento</span>
                    </label>
                    <input 
                      type="date" 
                      name="eventDate" 
                      value={form.eventDate} 
                      onChange={onChange} 
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                      <span className="text-gold">💰</span>
                      <span>Presupuesto estimado (opcional)</span>
                    </label>
                    <select
                      name="budget"
                      value={form.budget}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar rango</option>
                      <option value="50000-100000">$50.000 - $100.000</option>
                      <option value="100000-250000">$100.000 - $250.000</option>
                      <option value="250000-500000">$250.000 - $500.000</option>
                      <option value="500000+">Más de $500.000</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Message */}
            <div className="group">
              <label className="block text-sm font-medium text-stone mb-2 flex items-center gap-2">
                <span className="text-gold">💬</span>
                <span>{isExperience ? 'Detalles de tu experiencia' : 'Mensaje'}</span>
              </label>
              <textarea 
                name="message" 
                value={form.message} 
                onChange={onChange} 
                rows="6" 
                className="w-full px-4 py-3 border border-stone/20 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold/50 bg-white hover:border-gold/30 transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                placeholder={isExperience 
                  ? "Cuéntanos sobre tu experiencia ideal..."
                  : "Escribe tu mensaje aquí..."
                }
                required 
              />
            </div>

            {isExperience && (
              <div className="bg-gradient-to-r from-gold/5 to-copper/5 p-4 rounded-xl border border-gold/20">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div className="flex-1 text-sm text-stone/80">
                    <p className="font-medium text-stone mb-1">Confirmación de Reserva</p>
                    <p>Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas para confirmar los detalles de tu experiencia.</p>
                  </div>
                </div>
              </div>
            )}

            <button 
              disabled={submitting} 
              className="w-full btn-cta py-4 text-lg rounded-xl hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>{isExperience ? '✨ Enviar Reserva' : 'Enviar Mensaje'}</span>
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
      </div>
    </main>
  )
}
