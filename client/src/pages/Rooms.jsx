import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Picture from '../components/Picture'
import Lightbox from '../components/Lightbox'

export default function Rooms() {
  const rooms = [
    { 
      id: 1, 
      name: 'Suite Andina', 
      category: 'Premium Suite',
      price: 320, 
      img: '/images/Habitacion de lujo.png', 
      desc: 'Amplios espacios con arquitectura contemporánea, materiales nobles locales y vistas panorámicas a la majestuosa Cordillera de los Andes.',
      features: ['Vista panorámica', 'Terraza privada', 'Baño de mármol', 'Minibar premium'],
      size: '65 m²'
    },
    { 
      id: 2, 
      name: 'Estándar Cactus', 
      category: 'Comfort Room',
      price: 210, 
      img: '/images/Habitacion Estandar.png', 
      desc: 'Confort esencial con estética minimalista y cálida, diseñada para brindar una experiencia auténtica del NOA.',
      features: ['Vista al jardín', 'Balcón', 'Amenities locales', 'Wi-Fi premium'],
      size: '35 m²'
    },
    { 
      id: 4, 
      name: 'Familiar Quebrada', 
      category: 'Family Suite',
      price: 280, 
      img: '/images/Habitacion Familiar.png', 
      desc: 'Ideal para grupos y familias, con espacios amplios, luz natural abundante y la calidez característica del NOA.',
      features: ['Dos habitaciones', 'Sala de estar', 'Vista al valle', 'Cocina equipada'],
      size: '85 m²'
    },
    { 
      id: 5, 
      name: 'Suite Presidencial', 
      category: 'Luxury Suite',
      price: 480, 
      img: '/images/Suite Presidencial.png', 
      desc: 'La experiencia más exclusiva con atención personalizada, servicios premium y vistas incomparables.',
      features: ['Mayordomo personal', 'Jacuzzi privado', 'Terraza panorámica', 'Servicio 24h'],
      size: '120 m²'
    },
  ]
  
  const gallery = useMemo(() => rooms.map(r => ({ src: r.img, alt: r.name, caption: r.name, desc: r.desc })), [rooms])
  const [lbOpen, setLbOpen] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)

  return (
    <main>
      {/* Hero Section */}
      <section className="section-padding py-24 bg-gradient-to-b from-mist to-pure relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(184,152,90,0.1),transparent_50%)]"></div>
        <div className="container-luxury relative z-10 text-center">
          <div className="fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-gold"></div>
              <span className="text-gold text-2xl">◆</span>
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-gold"></div>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl text-gradient mb-8 tracking-tight">
              Suites de Montaña
            </h1>
            
            <p className="text-stone/70 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Cada suite es un refugio único donde la arquitectura contemporánea abraza la grandeza ancestral de los Andes, creando espacios de serenidad y conexión profunda.
            </p>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="section-padding py-32 bg-pure">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12">
            {rooms.map((room, index) => (
              <div key={room.id} className={`interactive-card rounded-3xl overflow-hidden fade-in-up stagger-${index + 1} group`}>
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={room.img} 
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone/60 via-transparent to-transparent group-hover:from-stone/40 transition-all duration-500"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-gold/90 text-stone px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm shimmer">
                      {room.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-gold/20 via-transparent to-transparent"></div>
                </div>
                <div className="p-8 lg:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-display text-3xl mb-2 text-stone">{room.name}</h3>
                      <p className="text-stone/60 font-medium">{room.size}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-stone/60 text-sm mb-1">Desde</p>
                      <p className="font-display text-2xl text-stone">${room.price}</p>
                      <p className="text-stone/60 text-sm">por noche</p>
                    </div>
                  </div>
                  
                  <p className="text-stone/80 leading-relaxed mb-8 text-lg">
                    {room.desc}
                  </p>
                  
                  <div className="mb-8">
                    <h4 className="font-medium text-stone mb-4 flex items-center gap-2">
                      <span className="w-6 h-[1px] bg-gradient-to-r from-gold to-transparent"></span>
                      Características
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {room.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-stone/70">
                          <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      to="/reservas" 
                      className="btn-cta flex-1 justify-center py-4 text-lg hover-glow"
                    >
                      Reservar Suite
                    </Link>
                    <button 
                      onClick={() => { setLbIndex(rooms.findIndex(x => x.id === room.id)); setLbOpen(true) }}
                      className="btn-outline flex-1 justify-center py-4 text-lg hover-lift"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding py-24 bg-gradient-to-br from-stone/5 to-cactus/5 relative">
        <div className="container-luxury text-center">
          <div className="fade-in-up">
            <h2 className="font-display text-4xl md:text-5xl mb-8 text-stone">
              ¿Necesitas ayuda para elegir?
            </h2>
            <p className="text-stone/70 text-xl mb-12 max-w-2xl mx-auto">
              Nuestro equipo está disponible para ayudarte a encontrar la suite perfecta para tu experiencia en el NOA.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/contacto" className="btn-cta text-lg px-12 py-4">
                Consultar Disponibilidad
              </Link>
              <a href="tel:+5493880000000" className="btn-outline text-lg px-8 py-4">
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      {lbOpen && (
        <Lightbox
          items={gallery}
          index={lbIndex}
          onClose={() => setLbOpen(false)}
          onPrev={() => setLbIndex((i) => (i - 1 + gallery.length) % gallery.length)}
          onNext={() => setLbIndex((i) => (i + 1) % gallery.length)}
        />
      )}
    </main>
  )
}
