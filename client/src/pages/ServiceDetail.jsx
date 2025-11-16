import { useMemo, useState } from 'react'
import Picture from '../components/Picture'
import Lightbox from '../components/Lightbox'
import { useParams, Link } from 'react-router-dom'

const SERVICES = {
  spa: {
    title: 'Spa & Rituales Andinos',
    subtitle: 'Un santuario de bienestar en la cordillera',
    desc:
      'Sumérgete en un oasis de tranquilidad donde la sabiduría ancestral andina se fusiona con técnicas de spa contemporáneas. Nuestro spa boutique ofrece tratamientos exclusivos con productos naturales de la región: hierbas sagradas, piedras volcánicas calientes y aguas termales de vertiente. Cada ritual está diseñado para restaurar el equilibrio entre cuerpo, mente y espíritu.',
    longDesc: 'El Spa Andino de Hotel Supay es más que un espacio de relajación; es un viaje sensorial que honra las tradiciones curativas de los pueblos originarios. Ubicado con vistas panorámicas al Cerro de los Siete Colores, nuestras instalaciones incluyen salas de tratamiento privadas, circuito de aguas termales, sauna seca y húmeda, y jardines meditativos con plantas aromáticas nativas.',
    hero: '/images/Complejo de piletas.png',
    gallery: ['/images/Complejo de piletas.png', '/images/Espacio de jardines.png', '/images/Ritual a la Pachamama.png'],
    features: ['Rituales andinos con chamanes locales', 'Masajes con piedras volcánicas calientes', 'Circuito de aguas termales naturales', 'Jardines meditativos con hierbas sagradas', 'Aromaterapia con aceites esenciales andinos', 'Jacuzzi panorámico con vista a la cordillera'],
    treatments: [
      { name: 'Ritual de la Pachamama', duration: '120 min', price: '$35.000' },
      { name: 'Masaje Andino con Piedras', duration: '90 min', price: '$28.000' },
      { name: 'Circuito Termal Completo', duration: '60 min', price: '$18.000' },
      { name: 'Facial con Quinoa y Miel', duration: '75 min', price: '$25.000' }
    ],
    schedule: 'Lunes a Domingo: 9:00 - 21:00 hrs',
    reservation: 'Se recomienda reservar con 24hs de anticipación',
  },
  gastronomia: {
    title: 'Gastronomía Andina',
    desc:
      'Cocina de autor que honra ingredientes de la quebrada y los valles calchaquíes. Recetas de altura con técnicas contemporáneas.',
    hero: '/images/Restaurante Andino.png',
    gallery: [
      '/images/Platos andinos gourmet.png',
      '/images/Postres reversionados.png',
      '/images/Desayuno buffet.png',
      '/images/Cócteles temáticos Supay.png',
      '/images/Maridaje de vinos de altura.png',
    ],
    features: ['Degustaciones locales', 'Carta estacional', 'Maridaje regional', 'Coctelería de autor'],
  },
  excursiones: {
    title: 'Excursiones',
    desc:
      'Rutas guiadas por paisajes andinos: cerros multicolores, cardonales y cielos estrellados. Opciones diurnas y nocturnas.',
    hero: '/images/Excursión al Cerro Hornocal.png',
    gallery: ['/images/Excursión al Cerro Hornocal.png', '/images/Luces del Supay – Tour nocturno.png'],
    features: ['Trekking andino', 'Tour nocturno', 'Miradores y rutas paisajísticas'],
  },
  casino: {
    title: 'Casino',
    desc:
      'Entretenimiento nocturno con estética minimalista y ambiente premium. Juegos, coctelería y música bajo la atmósfera del Supay.',
    hero: '/images/Casino del Supay.png',
    gallery: ['/images/Casino del Supay.png', '/images/Hall Recepcion.png'],
    features: ['Salas elegantes', 'Bar de autor', 'Experiencia nocturna'],
  },
  eventos: {
    title: 'Eventos',
    desc:
      'Salones y espacios versátiles para eventos sociales y corporativos. Ambientación premium y asistencia integral.',
    hero: '/images/Eventos Interior.png',
    gallery: ['/images/Eventos Interior.png', '/images/Eventos Exterior.png', '/images/Hall Recepcion.png'],
    features: ['Salones modulables', 'Catering del hotel', 'Coordinación dedicada'],
  },
  experiencias: {
    title: 'Experiencias',
    desc:
      'Diseñamos itinerarios personalizados: bienestar, aventura y cultura, para conectar con la energía única del NOA.',
    hero: '/images/Museo Supay.png',
    gallery: ['/images/Museo Supay.png', '/images/Espacio de jardines.png'],
    features: ['Personalización total', 'Bienestar & aventura', 'Acompañamiento experto'],
  },
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const svc = SERVICES[slug]
  const galleryItems = useMemo(() => (svc?.gallery || []).map((src) => ({
    src,
    alt: svc?.title,
    caption: svc?.title,
    desc: svc?.desc,
  })), [svc])
  const [lbOpen, setLbOpen] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)

  if (!svc) {
    return (
      <main className="max-w-5xl mx-auto px-6 md:px-10 py-12">
        <p className="mb-6">Servicio no encontrado.</p>
        <Link to="/servicios" className="underline text-cactus">Volver a Servicios</Link>
      </main>
    )
  }

  return (
    <main className="bg-gradient-to-b from-mist to-pure">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <Picture src={svc.hero} alt={svc.title} className="w-full h-full object-cover scale-105" loading="eager" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex items-end pb-16 px-6 md:px-10">
          <div className="container-luxury">
            <div className="max-w-3xl fade-in-up">
              {svc.subtitle && (
                <p className="text-gold text-sm md:text-base font-medium tracking-wider uppercase mb-4">{svc.subtitle}</p>
              )}
              <h1 className="font-display text-5xl md:text-7xl text-cream mb-6">{svc.title}</h1>
              <p className="text-cream/90 text-lg md:text-xl max-w-2xl">{svc.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-luxury py-16 md:py-24">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Content Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {svc.longDesc && (
              <div className="fade-in-up">
                <h2 className="font-display text-3xl md:text-4xl text-stone mb-6">Una Experiencia Única</h2>
                <p className="text-stone/80 text-lg leading-relaxed">{svc.longDesc}</p>
              </div>
            )}

            {/* Treatments/Menu */}
            {svc.treatments && (
              <div className="fade-in-up stagger-1">
                <h2 className="font-display text-3xl md:text-4xl text-stone mb-8">Tratamientos Disponibles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {svc.treatments.map((treatment, idx) => (
                    <div key={idx} className="card-luxury p-6 hover-lift transition-all duration-300">
                      <h3 className="font-display text-xl text-stone mb-3">{treatment.name}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone/60 flex items-center gap-2">
                          <span>🕒</span> {treatment.duration}
                        </span>
                        <span className="text-gold font-medium text-lg">{treatment.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {galleryItems.length > 0 && (
              <div className="fade-in-up stagger-2">
                <h2 className="font-display text-3xl md:text-4xl text-stone mb-8">Galería</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryItems.map((g, i) => (
                    <button 
                      key={g.src} 
                      onClick={() => { setLbIndex(i); setLbOpen(true) }} 
                      className="group relative overflow-hidden rounded-2xl aspect-square hover-lift"
                    >
                      <Picture 
                        src={g.src} 
                        alt={`${svc.title} ${i + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        loading="lazy" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white text-sm">Ver imagen</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Features Card */}
              <div className="card-luxury p-8 fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-copper/20 flex items-center justify-center">
                    <span className="text-xl">✨</span>
                  </div>
                  <h3 className="font-display text-2xl text-stone">Incluye</h3>
                </div>
                <ul className="space-y-3">
                  {svc.features?.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-stone/70">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2 pulse-glow"></span>
                      <span className="text-sm leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Info Card */}
              {(svc.schedule || svc.reservation) && (
                <div className="card-luxury p-6 bg-gradient-to-br from-gold/5 to-copper/5 fade-in-up stagger-1">
                  {svc.schedule && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-stone mb-2">
                        <span>🕒</span>
                        <span className="font-medium text-sm">Horarios</span>
                      </div>
                      <p className="text-stone/70 text-sm pl-6">{svc.schedule}</p>
                    </div>
                  )}
                  {svc.reservation && (
                    <div>
                      <div className="flex items-center gap-2 text-stone mb-2">
                        <span>📅</span>
                        <span className="font-medium text-sm">Reservas</span>
                      </div>
                      <p className="text-stone/70 text-sm pl-6">{svc.reservation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3 fade-in-up stagger-2">
                <Link 
                  to={`/contacto?motivo=experiencia&servicio=${slug}`}
                  className="btn-cta w-full justify-center py-4 text-lg rounded-xl hover:scale-[1.02] transition-transform"
                >
                  Reservar Experiencia
                </Link>
                <Link to="/servicios" className="btn-outline w-full justify-center py-3 rounded-xl">
                  Ver Todas las Experiencias
                </Link>
                <Link to="/contacto" className="block text-center text-gold hover:text-copper text-sm font-medium transition-colors">
                  ¿Necesitas ayuda? Contáctanos →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Lightbox */}
      {lbOpen && <Lightbox items={galleryItems} startIndex={lbIndex} onClose={() => setLbOpen(false)} />}
    </main>
  )
}
