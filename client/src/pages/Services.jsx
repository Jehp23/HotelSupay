import { Link } from 'react-router-dom'
import Picture from '../components/Picture'

export default function Services() {
  const services = [
    {
      id: 1,
      name: 'Spa Andino',
      category: 'Bienestar',
      title: 'Spa & Rituales Andinos',
      description: 'Un santuario de paz donde la sabiduría ancestral se encuentra con técnicas de bienestar contemporáneas. Tratamientos con hierbas sagradas, piedras volcánicas y aguas termales de la cordillera.',
      features: ['Masajes con piedras calientes volcánicas', 'Aromaterapia con hierbas andinas', 'Circuito de aguas termales', 'Ritual de la Pachamama', 'Sauna seca y húmeda', 'Jacuzzi panorámico'],
      duration: '90-120 min',
      price: 'Desde $25.000',
      img: '/images/Complejo de piletas.webp',
      slug: 'spa'
    },
    {
      id: 2,
      name: 'Excursiones Guiadas',
      category: 'Aventura',
      title: 'Excursiones & Aventuras',
      description: 'Explora los paisajes más impresionantes del NOA con guías expertos locales. Desde el Cerro de los 14 Colores hasta las místicas Salinas Grandes, cada ruta es una conexión profunda con la naturaleza.',
      features: ['Cerro Hornocal (14 Colores)', 'Salinas Grandes y Purmamarca', 'Quebrada de Humahuaca UNESCO', 'Tour nocturno de estrellas', 'Transporte 4x4 premium', 'Guías bilingües certificados'],
      duration: 'Día completo',
      price: 'Desde $35.000',
      img: '/images/Excursión al Cerro Hornocal.webp',
      slug: 'excursiones'
    },
    {
      id: 3,
      name: 'Gastronomía Gourmet',
      category: 'Gastronomía',
      title: 'Gastronomía de Altura',
      description: 'Una experiencia culinaria que celebra los sabores auténticos del NOA. Cocina de autor con ingredientes orgánicos de la quebrada, quinoa real, llama, cordero y hierbas aromáticas de altura.',
      features: ['Menú degustación 7 pasos', 'Maridaje de vinos de altura', 'Ingredientes km 0', 'Chef especializado en cocina andina', 'Coctelería con destilados locales', 'Experiencia de mesa privada'],
      duration: '2-3 horas',
      price: 'Desde $45.000',
      img: '/images/Restaurante Andino.webp',
      slug: 'gastronomia'
    },
    {
      id: 4,
      name: 'Casino del Supay',
      category: 'Entretenimiento',
      title: 'Casino del Supay',
      description: 'Entretenimiento nocturno sofisticado en un ambiente de lujo minimalista. Juegos de mesa premium, máquinas de última generación y bar de autor con vista a la cordillera.',
      features: ['Ruleta y blackjack profesional', 'Máquinas slots premium', 'Poker room exclusiva', 'Bar de cócteles signature', 'Shows en vivo semanales', 'Dress code elegante'],
      duration: 'Abierto 20:00 - 04:00',
      price: 'Entrada libre',
      img: '/images/Casino del Supay.webp',
      slug: 'casino'
    },
    {
      id: 5,
      name: 'Eventos Exclusivos',
      category: 'Celebraciones',
      title: 'Eventos & Celebraciones',
      description: 'Espacios únicos para bodas, eventos corporativos y celebraciones memorables con la majestuosidad de los Andes como telón de fondo. Coordinación integral y atención personalizada.',
      features: ['Salones panorámicos modulables', 'Catering gourmet personalizado', 'Coordinación y planificación integral', 'Decoración temática andina', 'Tecnología audiovisual', 'Alojamiento para invitados'],
      duration: 'A medida',
      price: 'Consultar',
      img: '/images/Eventos Interior.webp',
      slug: 'eventos'
    },
    {
      id: 6,
      name: 'Experiencias Personalizadas',
      category: 'Exclusivo',
      title: 'Experiencias a Medida',
      description: 'Diseñamos itinerarios completamente personalizados según tus intereses. Desde ceremonias ancestrales hasta aventuras extremas, cada experiencia es única y memorable.',
      features: ['Consultoría personal con concierge', 'Actividades diseñadas a medida', 'Guías privados exclusivos', 'Acceso a lugares restringidos', 'Ceremonias con chamanes locales', 'Fotografía profesional incluida'],
      duration: 'Flexible',
      price: 'Desde $80.000',
      img: '/images/Museo Supay.webp',
      slug: 'experiencias'
    }
  ]

  return (
    <main>
      {/* Hero Section */}
      <section className="section-padding py-24 bg-gradient-to-b from-mist to-pure relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(184,152,90,0.1),transparent_50%)]"></div>
        <div className="container-luxury relative z-10 text-center">
          <div className="fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-gold"></div>
              <span className="text-gold text-2xl">◆</span>
              <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-gold"></div>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl text-gradient mb-8 tracking-tight">
              Experiencias Únicas
            </h1>
            
            <p className="text-stone/70 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Cada servicio está cuidadosamente diseñado para conectarte con la esencia del NOA argentino, combinando tradición ancestral con lujo contemporáneo.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding py-32 bg-pure">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <Link 
                to={`/servicios/${service.slug}`} 
                key={service.slug} 
                className="fade-in-up group block" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="card-luxury overflow-hidden h-full">
                  <div className="relative overflow-hidden">
                    <Picture 
                      src={service.img} 
                      alt={service.title} 
                      className="h-64 w-full object-cover transition-all duration-700 group-hover:scale-110" 
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gold text-sm font-medium tracking-wide uppercase shimmer">{service.category}</span>
                      {service.price && (
                        <span className="text-xs text-stone/60 bg-gold/10 px-2 py-1 rounded-full">{service.price}</span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl mb-3 text-stone group-hover:text-gold transition-colors duration-300">{service.title}</h3>
                    
                    {service.duration && (
                      <div className="flex items-center gap-2 text-xs text-stone/60 mb-4">
                        <span>🕒</span>
                        <span>{service.duration}</span>
                      </div>
                    )}
                    
                    <p className="text-stone/70 leading-relaxed mb-6 line-height-luxury text-sm">{service.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-stone mb-3 flex items-center gap-2 text-sm">
                        <span className="w-4 h-[1px] bg-gradient-to-r from-gold to-transparent"></span>
                        Incluye
                      </h4>
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-stone/60 text-xs">
                            <span className="w-1 h-1 bg-gold rounded-full pulse-glow"></span>
                            {feature}
                          </li>
                        ))}
                        {service.features.length > 4 && (
                          <li className="text-gold text-xs font-medium">+ {service.features.length - 4} más</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="btn-outline w-full justify-center hover-glow focus-luxury text-center py-3 group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-all duration-300">
                      Ver Detalles
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Service */}
      <section className="section-padding py-32 bg-gradient-to-br from-stone/5 to-cactus/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(184,152,90,0.15),transparent_60%)]"></div>
        <div className="container-luxury relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🌟</span>
                <span className="bg-gradient-to-r from-gold to-copper text-stone px-4 py-2 rounded-full text-sm font-medium">
                  Experiencia Destacada
                </span>
              </div>
              
              <h2 className="font-display text-4xl md:text-5xl mb-6 text-stone">
                Ritual del Amanecer Andino
              </h2>
              
              <p className="text-stone/80 text-xl leading-relaxed mb-8">
                Una ceremonia única que combina meditación, yoga y conexión espiritual con la salida del sol sobre la Cordillera de los Andes. Incluye desayuno gourmet y terapia de sonido con cuencos tibetanos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/servicios/experiencias" 
                  className="btn-cta text-lg px-8 py-4"
                >
                  Ver Experiencia
                </Link>
                <Link to="/contacto" className="btn-outline text-lg px-6 py-4">
                  Más Información
                </Link>
              </div>
            </div>
            
            <div className="fade-in-up stagger-1">
              <div className="relative">
                <Picture 
                  src="/images/Ritual a la Pachamama.png" 
                  alt="Ritual del Amanecer Andino" 
                  className="rounded-3xl shadow-2xl" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding py-24 bg-pure">
        <div className="container-luxury text-center">
          <div className="fade-in-up">
            <h2 className="font-display text-4xl md:text-5xl mb-8 text-stone">
              ¿Listo para tu experiencia?
            </h2>
            <p className="text-stone/70 text-xl mb-12 max-w-2xl mx-auto">
              Nuestro equipo de concierge está disponible para diseñar la experiencia perfecta según tus preferencias.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/reservas" className="btn-cta text-lg px-12 py-4">
                Planificar Experiencia
              </Link>
              <a href="mailto:concierge@hotelsupay.com" className="btn-outline text-lg px-8 py-4">
                Contactar Concierge
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
