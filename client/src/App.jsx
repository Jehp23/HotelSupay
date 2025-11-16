import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
// Removed FloatingElements for better performance
import LoadingScreen from './components/LoadingScreen'
import { SmoothScrollProvider, ScrollProgress } from './components/SmoothScroll'
import { useState, useEffect } from 'react'
import Logo from './components/Logo'

function Header() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const goPanel = () => {
    if (!user) return
    if (user.role === 'admin' || user.role === 'operator') nav('/admin')
    else nav('/mi-cuenta')
  }

  const navItems = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/habitaciones', label: 'Suites' },
    { to: '/servicios', label: 'Experiencias' },
    { to: '/reservas', label: 'Reservas' },
    { to: '/contacto', label: 'Contacto' }
  ]

  return (
    <>
      <header className="section-padding py-4 lg:py-6 flex items-center justify-between glass-effect sticky top-0 z-50 border-b border-warm-cream/30 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 fade-in-scale group">
          <Logo className="h-12 lg:h-14 transition-transform group-hover:scale-105 drop-shadow-lg" alt="Hotel Supay" />
          <div className="flex flex-col">
            <span className="font-display text-xl lg:text-2xl tracking-wider text-gradient font-semibold">Hotel Supay</span>
            <span className="text-xs text-stone/60 tracking-widest hidden lg:block">LUXURY RETREAT</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 
                `relative font-medium tracking-wide transition-all duration-300 py-2 px-1 ${
                  isActive 
                    ? 'text-stone after:w-full' 
                    : 'text-stone/70 hover:text-stone after:w-0 hover:after:w-full'
                } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-gradient-to-r after:from-gold after:to-copper after:transition-all after:duration-300 fade-in-up`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/reservas" className="btn-cta px-6 py-3 text-sm">
            Reservar Experiencia
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="btn-outline px-4 py-2 text-sm">Ingresar</Link>
              <Link to="/registro" className="link-underline text-sm font-medium text-stone/70 hover:text-stone">
                Crear Cuenta
              </Link>
            </>
          ) : (
            <>
              <button onClick={goPanel} className="btn-outline px-4 py-2 text-sm">
                {user.name?.split(' ')[0] || 'Mi cuenta'}
                {user.role !== 'user' ? ` · ${user.role}` : ''}
              </button>
              <button 
                onClick={() => { logout(); nav('/') }} 
                className="link-underline text-sm font-medium text-stone/70 hover:text-stone"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Mejorado */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden relative flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-gradient-to-br from-gold/10 to-copper/10 backdrop-blur-sm border border-gold/20 transition-all duration-300 hover:scale-105 hover:bg-gold/20"
          aria-label="Toggle mobile menu"
        >
          <span className={`w-5 h-0.5 bg-gradient-to-r from-gold to-copper rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
          <span className={`w-5 h-0.5 bg-gradient-to-r from-gold to-copper rounded-full transition-all duration-300 my-1 ${mobileMenuOpen ? 'opacity-0 scale-0' : ''}`}></span>
          <span className={`w-5 h-0.5 bg-gradient-to-r from-gold to-copper rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
        </button>
      </header>

      {/* Mobile Menu Overlay - Premium */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-stone/40 to-black/60 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-gradient-to-b from-pure via-cream/50 to-mist shadow-2xl border-l border-gold/20 transform transition-all duration-500 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-copper to-gold"></div>
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-gold/10 to-copper/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-4 w-12 h-12 bg-gradient-to-br from-copper/10 to-gold/10 rounded-full blur-lg"></div>
          <div className="section-padding py-8">
            <div className="relative z-10 flex items-center justify-between mb-6">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 group hover-lift">
                <Logo className="h-12 w-auto transition-transform duration-300 group-hover:scale-105 breathe drop-shadow-lg" alt="Hotel Supay" />
                <span className="font-display text-xl text-stone group-hover:text-gold transition-colors duration-300 letter-spacing-luxury">Hotel Supay</span>
              </Link>
              
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-stone/10 to-stone/20 border border-stone/20 transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-gold/20 hover:to-copper/20 hover:border-gold/30"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-stone transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="space-y-4 mb-12 mt-8">
              {navItems.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `block font-display text-xl tracking-wide transition-all duration-300 py-4 px-6 rounded-xl relative overflow-hidden group ${
                      isActive 
                        ? 'text-stone bg-gradient-to-r from-gold/15 to-copper/15 border border-gold/30 shadow-lg' 
                        : 'text-stone/70 hover:text-stone hover:bg-gradient-to-r hover:from-gold/5 hover:to-copper/5 border border-transparent hover:border-gold/20'
                    } fade-in-up`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10 flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-gold' : 'bg-stone/30 group-hover:bg-gold/70'}`}></span>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-copper/5 animate-pulse"></div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="space-y-4 border-t border-stone/10 pt-8">
              <Link 
                to="/reservas" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn-cta w-full justify-center py-4 text-lg"
              >
                Reservar Experiencia
              </Link>
              
              {!user ? (
                <div className="space-y-3">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-outline w-full justify-center py-3"
                  >
                    Ingresar
                  </Link>
                  <Link 
                    to="/registro" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center link-underline font-medium text-stone/70"
                  >
                    Crear Cuenta
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => { goPanel(); setMobileMenuOpen(false) }} 
                    className="btn-outline w-full justify-center py-3"
                  >
                    {user.name?.split(' ')[0] || 'Mi cuenta'}
                    {user.role !== 'user' ? ` · ${user.role}` : ''}
                  </button>
                  <button 
                    onClick={() => { logout(); nav('/'); setMobileMenuOpen(false) }} 
                    className="block w-full text-center link-underline font-medium text-stone/70"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Footer() {
  return (
    <footer className="section-padding py-24 bg-gradient-to-br from-stone via-warm-stone to-stone text-cream mt-32 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-16 left-16 w-24 h-24 border border-gold/40 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border border-copper/30 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-terracotta/40 rounded-full"></div>
      </div>
      
      <div className="container-luxury relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 xl:gap-16 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <Logo className="h-16 lg:h-20 drop-shadow-xl" alt="Hotel Supay" />
              <div className="flex flex-col">
                <span className="font-display text-3xl lg:text-4xl tracking-wider text-gold font-semibold">Hotel Supay</span>
                <span className="text-sm text-cream/60 tracking-widest">LUXURY RETREAT · NOA ARGENTINA</span>
              </div>
            </div>
            <p className="text-cream/90 text-lg leading-relaxed mb-8 max-w-lg">
              Un refugio de lujo minimalista donde la arquitectura contemporánea abraza la majestuosidad ancestral del Noroeste Argentino. Cada momento es una invitación a reconectar con la esencia.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="mailto:reservas@hotelsupay.com" className="w-12 h-12 bg-gradient-to-br from-gold/20 to-copper/20 rounded-full flex items-center justify-center hover:from-gold/30 hover:to-copper/30 transition-all duration-300 group">
                <span className="text-gold group-hover:scale-110 transition-transform">✉️</span>
              </a>
              <a href="tel:+5493880000000" className="w-12 h-12 bg-gradient-to-br from-gold/20 to-copper/20 rounded-full flex items-center justify-center hover:from-gold/30 hover:to-copper/30 transition-all duration-300 group">
                <span className="text-gold group-hover:scale-110 transition-transform">📞</span>
              </a>
              <a href="#" className="w-12 h-12 bg-gradient-to-br from-gold/20 to-copper/20 rounded-full flex items-center justify-center hover:from-gold/30 hover:to-copper/30 transition-all duration-300 group">
                <span className="text-gold group-hover:scale-110 transition-transform">🌐</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="fade-in-up stagger-1">
            <h4 className="font-display text-xl mb-8 text-gold flex items-center gap-2">
              <span className="w-8 h-[1px] bg-gradient-to-r from-gold to-transparent"></span>
              Experiencias
            </h4>
            <ul className="space-y-4 text-cream/80">
              <li>
                <Link to="/habitaciones" className="hover:text-cream transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-gold rounded-full group-hover:scale-150 transition-transform"></span>
                  Suites de Montaña
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-cream transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-gold rounded-full group-hover:scale-150 transition-transform"></span>
                  Spa & Bienestar
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-cream transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-gold rounded-full group-hover:scale-150 transition-transform"></span>
                  Gastronomía Andina
                </Link>
              </li>
              <li>
                <Link to="/reservas" className="hover:text-cream transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-gold rounded-full group-hover:scale-150 transition-transform"></span>
                  Reservas Exclusivas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="fade-in-up stagger-2">
            <h4 className="font-display text-xl mb-8 text-gold flex items-center gap-2">
              <span className="w-8 h-[1px] bg-gradient-to-r from-gold to-transparent"></span>
              Contacto
            </h4>
            <div className="space-y-6 text-cream/80">
              <div className="flex items-start gap-4">
                <span className="text-gold text-lg mt-1">📍</span>
                <div>
                  <p className="font-medium text-cream mb-1">Ubicación</p>
                  <p className="text-sm leading-relaxed">
                    Cerro de los Siete Colores<br />
                    Purmamarca, Jujuy<br />
                    Quebrada de Humahuaca<br />
                    Argentina
                  </p>
                  <a 
                    href="https://maps.google.com/maps?q=Cerro+de+los+Siete+Colores,Purmamarca,Jujuy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gold hover:text-cream transition-colors mt-2"
                  >
                    <span>🗺️</span> Ver en Google Maps
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-gold text-lg mt-1">📞</span>
                <div>
                  <p className="font-medium text-cream mb-1">Reservas</p>
                  <a href="tel:+5493880000000" className="text-sm hover:text-cream transition-colors">
                    +54 9 388 000 000
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-gold text-lg mt-1">✉️</span>
                <div>
                  <p className="font-medium text-cream mb-1">Email</p>
                  <a href="mailto:reservas@hotelsupay.com" className="text-sm hover:text-cream transition-colors">
                    reservas@hotelsupay.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-cream/20 pt-8 fade-in-up stagger-3">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-sm text-cream/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-gold text-lg">◆</span>
                <span>© {new Date().getFullYear()} Hotel Supay</span>
              </div>
              <span className="hidden lg:block">·</span>
              <span className="hidden lg:block">Todos los derechos reservados</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="hover:text-cream transition-colors cursor-pointer">
                Política de Privacidad
              </button>
              <span className="text-cream/30">·</span>
              <button className="hover:text-cream transition-colors cursor-pointer">
                Términos de Servicio
              </button>
              <span className="text-cream/30">·</span>
              <Link to="/contacto" className="hover:text-cream transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Location Map Section */}
      <div className="bg-gradient-to-b from-stone to-warm-stone border-t border-cream/10 relative overflow-hidden">
        <div className="container-luxury py-16 relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display text-gold mb-4">Nuestra Ubicación</h3>
            <p className="text-cream/80 max-w-2xl mx-auto">
              En el corazón de la Quebrada de Humahuaca, frente al majestuoso Cerro de los Siete Colores, 
              donde la naturaleza pinta el paisaje con colores únicos en el mundo.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Map */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gold/20">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3659.123456789!2d-65.50050000000001!3d-23.746100000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x941c3c8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sCerro%20de%20los%20Siete%20Colores%2C%20Purmamarca%2C%20Jujuy%2C%20Argentina!5e1!3m2!1ses!2sar!4v1696176000000!5m2!1ses!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hotel Supay - Cerro de los Siete Colores, Purmamarca"
                ></iframe>
              </div>
              
              {/* Map Overlay Info */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-cream p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gold">📍</span>
                  <span>Purmamarca, Jujuy</span>
                </div>
              </div>
            </div>
            
            {/* Location Details */}
            <div className="space-y-8">
              <div>
                <h4 className="text-2xl font-display text-gold mb-4">Un Destino Único</h4>
                <p className="text-cream/90 leading-relaxed mb-6">
                  Hotel Supay se encuentra estratégicamente ubicado en Purmamarca, 
                  uno de los pueblos más pintorescos de la Quebrada de Humahuaca, 
                  declarada Patrimonio de la Humanidad por la UNESCO.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gold/10 to-copper/10 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gold text-lg">🏔️</span>
                      <span className="font-medium text-cream">Cerro 7 Colores</span>
                    </div>
                    <p className="text-cream/70 text-sm">Vista directa desde todas las suites</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-terracotta/10 to-sage/10 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gold text-lg">🏛️</span>
                      <span className="font-medium text-cream">Centro Histórico</span>
                    </div>
                    <p className="text-cream/70 text-sm">A 2 minutos caminando</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cactus/10 to-sage/10 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gold text-lg">✈️</span>
                      <span className="font-medium text-cream">Aeropuerto Jujuy</span>
                    </div>
                    <p className="text-cream/70 text-sm">65 km - 1 hora en auto</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-copper/10 to-gold/10 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gold text-lg">🚌</span>
                      <span className="font-medium text-cream">Terminal Tilcara</span>
                    </div>
                    <p className="text-cream/70 text-sm">20 km - 25 minutos</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-cream/20">
                <h5 className="font-medium text-cream mb-3">Coordenadas GPS</h5>
                <div className="flex items-center gap-4 text-sm text-cream/70">
                  <span>Latitud: -23.7461°</span>
                  <span>Longitud: -65.5005°</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a 
                    href="https://maps.google.com/maps?q=Cerro+de+los+Siete+Colores,Purmamarca,Jujuy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-outline px-4 py-2 text-sm rounded-lg hover:bg-gold/20"
                  >
                    🗺️ Google Maps
                  </a>
                  <a 
                    href="https://maps.apple.com/?q=Purmamarca,Jujuy,Argentina" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-outline px-4 py-2 text-sm rounded-lg hover:bg-gold/20"
                  >
                    🍎 Apple Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-copper to-gold opacity-50"></div>
      </div>
    </footer>
  )
}

export default function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    // Solo mostrar loading en la carga inicial (reducido a 1.5 segundos)
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        setIsInitialLoad(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isInitialLoad])

  useEffect(() => {
    // Scroll to top on route change (suave)
    if (!isInitialLoad) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname, isInitialLoad])

  return (
    <>
      <LoadingScreen 
        isLoading={isLoading} 
        onComplete={() => setIsLoading(false)} 
      />
      
      <SmoothScrollProvider>
        <div className="min-h-screen bg-pure text-stone">
          <ScrollProgress />
          {/* Removed 3D particles for better performance */}
          <Header />
          <div className="fade-in-up">
            <Outlet />
          </div>
          <Footer />
        </div>
      </SmoothScrollProvider>
    </>
  )
}
