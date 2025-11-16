import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Picture from '../components/Picture'
import Lightbox from '../components/Lightbox'
import Carousel from '../components/Carousel'
// Removed 3D components for better performance
export default function Home() {
  const gallery = useMemo(() => ([
    { src: '/images/Espacio de jardines.png', alt: 'Jardines', caption: 'Jardines del Supay', desc: 'Senderos entre cardones, piedra y vegetación nativa.' },
    { src: '/images/Complejo de piletas.png', alt: 'Piletas', caption: 'Complejo de piletas', desc: 'Aguas templadas con vistas a las montañas.' },
    { src: '/images/Restaurante Andino.png', alt: 'Restaurante Andino', caption: 'Restaurante Andino', desc: 'Cocina de autor con productos de la región.' },
  ]), [])
  const [lbOpen, setLbOpen] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)

  return (
    <main>
      {/* Hero Section - Optimized */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-900">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/Hotel Supay.webp" 
            alt="Hotel Supay" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto relative z-10 text-center px-6 py-20">
          <div className="animate-fade-in-up max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-gold"></div>
              <span className="text-gold text-3xl">◆</span>
              <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-gold"></div>
            </div>
            
            <h1 className="font-display text-7xl md:text-9xl text-white mb-8 tracking-tight drop-shadow-2xl">
              Hotel Supay
            </h1>
            
            <p className="text-white text-2xl md:text-3xl mb-6 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-lg">
              Refugio de lujo en la Cordillera de los Andes
            </p>
            
            <p className="text-white/90 text-xl mb-16 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Donde la naturaleza del NOA se encuentra con la hospitalidad excepcional
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/habitaciones" className="btn-cta group">
                <span>Explorar Habitaciones</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/servicios" className="btn-outline-light">
                Descubrir Experiencias
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-gold rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Experiences Section - Premium */}
      <section className="section-padding py-32 bg-gradient-to-b from-mist to-pure relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,152,90,0.1),transparent_50%)]"></div>
          <div className="container-luxury relative z-10">
            <div className="text-center mb-20 fade-in-up">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-gold"></div>
                <span className="text-gold text-lg">◆</span>
                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-gold"></div>
              </div>
              <h2 className="font-display text-5xl md:text-6xl text-gradient mb-6 tracking-tight">
                Experiencias Únicas
              </h2>
              <p className="text-stone/70 text-xl max-w-2xl mx-auto leading-relaxed">
                Cada momento en Hotel Supay está diseñado para conectarte con la esencia del NOA argentino
              </p>
            </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="card-luxury p-10 text-center fade-in-up stagger-1 group hover-lift">
              <div className="icon-badge mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-gold/18 to-copper/12 ring-1 ring-cream/40 flex items-center justify-center icon-glow-gold">
                <img
                  src="/icons/mountain-clean.png"
                  alt="Ícono Montaña"
                  className="icon-img"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icons/mountain.png' }}
                />
              </div>
              <h3 className="font-display text-2xl mb-4 text-stone">Suites de Montaña</h3>
              <p className="text-stone/70 leading-relaxed mb-6">
                Espacios luminosos con arquitectura contemporánea, materiales nobles locales y vistas panorámicas a la Cordillera de los Andes.
              </p>
              <Link to="/habitaciones" className="inline-flex items-center gap-2 text-gold font-medium hover:text-copper transition-colors">
                Explorar Suites <span>→</span>
              </Link>
            </div>
            
            <div className="card-luxury p-10 text-center fade-in-up stagger-2 group hover-lift">
              <div className="icon-badge mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-sage/18 to-cactus/12 ring-1 ring-cream/40 flex items-center justify-center icon-glow-cactus">
                <img
                  src="/icons/leaf-clean.png"
                  alt="Ícono Hoja"
                  className="icon-img"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icons/leaf.png' }}
                />
              </div>
              <h3 className="font-display text-2xl mb-4 text-stone">Spa Ancestral</h3>
              <p className="text-stone/70 leading-relaxed mb-6">
                Rituales de bienestar con hierbas medicinales locales, aguas termales de vertiente y terapias bajo el cielo estrellado del altiplano.
              </p>
              <Link to="/servicios" className="inline-flex items-center gap-2 text-gold font-medium hover:text-copper transition-colors">
                Descubrir Wellness <span>→</span>
              </Link>
            </div>
            
            <div className="card-luxury p-10 text-center fade-in-up stagger-3 group hover-lift">
              <div className="icon-badge mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-terracotta/18 to-gold/12 ring-1 ring-cream/40 flex items-center justify-center icon-glow-terracotta">
                <img
                  src="/icons/cutlery-clean.png"
                  alt="Ícono Cubiertos"
                  className="icon-img"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icons/cutlery.png' }}
                />
              </div>
              <h3 className="font-display text-2xl mb-4 text-stone">Cocina de Altura</h3>
              <p className="text-stone/70 leading-relaxed mb-6">
                Gastronomía de autor que celebra los sabores únicos del NOA, con ingredientes orgánicos locales y técnicas culinarias contemporáneas.
              </p>
              <Link to="/servicios" className="inline-flex items-center gap-2 text-gold font-medium hover:text-copper transition-colors">
                Experiencias Gastronómicas <span>→</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-gold/10 to-copper/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-copper/10 to-gold/10 rounded-full blur-2xl"></div>
      </section>

      {/* Gallery Section - Premium */}
      <section className="section-padding py-32 bg-gradient-to-b from-pure to-mist relative">
        <div className="container-luxury">
          <div className="text-center mb-20 fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-gold"></div>
              <span className="text-gold text-lg">◆</span>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-gold"></div>
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-gradient mb-6 tracking-tight">
              Espacios que Inspiran
            </h2>
            <p className="text-stone/70 text-xl max-w-2xl mx-auto leading-relaxed">
              Cada rincón de Hotel Supay cuenta una historia de armonía entre arquitectura contemporánea y paisaje ancestral
            </p>
          </div>
          
          <div className="fade-in-up stagger-2">
            <Carousel items={gallery} onSlideClick={(i) => { setLbIndex(i); setLbOpen(true) }} />
          </div>
          
          {lbOpen && (
            <Lightbox
              items={gallery}
              index={lbIndex}
              onClose={() => setLbOpen(false)}
              onPrev={() => setLbIndex(i => (i - 1 + gallery.length) % gallery.length)}
              onNext={() => setLbIndex(i => (i + 1) % gallery.length)}
            />
          )}
        </div>
      </section>

      {/* Call to Action Section - Premium */}
      <section className="section-padding py-32 bg-gradient-to-br from-stone via-cactus/10 to-sage/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(184,152,90,0.15),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-gold/30 rounded-full"></div>
          <div className="absolute bottom-32 right-32 w-24 h-24 border border-copper/30 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-terracotta/30 rounded-full"></div>
        </div>
        
        <div className="container-luxury relative z-10 text-center">
          <div className="mx-auto max-w-4xl rounded-2xl bg-black/20 backdrop-blur-sm p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.25)] fade-in-up">
            <h2 className="font-display text-5xl md:text-7xl text-cream mb-6 tracking-tight leading-tight drop-shadow-xl">
              Tu refugio en las
              <span className="block text-gradient bg-gradient-to-r from-gold via-copper to-gold bg-clip-text text-transparent">
                alturas del NOA
              </span>
            </h2>
            
            <p className="text-cream/95 text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-xl">
              Desconéctate del mundo y reconéctate contigo mismo en un entorno de lujo sostenible y belleza natural incomparable.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/reservas" className="btn-cta text-xl px-16 py-6 shadow-luxury">
                Reservar Ahora
              </Link>
              <Link to="/contacto" className="btn-outline text-xl px-12 py-5 text-cream border-cream/80 bg-black/20 hover:bg-black/30 hover:text-cream backdrop-blur-sm">
                Consultar Disponibilidad
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
