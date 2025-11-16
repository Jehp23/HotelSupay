import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Float, Stars, Environment } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { useParallax } from '../hooks/useParallax'
import * as THREE from 'three'

// Componente del hotel 3D (geometría simple pero elegante)
function HotelBuilding() {
  const buildingRef = useRef()
  
  useFrame((state) => {
    if (buildingRef.current) {
      buildingRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
      buildingRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={buildingRef}>
      {/* Edificio principal */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 2, 1.5]} />
        <meshStandardMaterial color="#8B7355" roughness={0.3} />
      </mesh>
      
      {/* Techo */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[2, 0.8, 4]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Torres laterales */}
      <mesh position={[-2, -0.3, 0]}>
        <boxGeometry args={[0.8, 1.4, 0.8]} />
        <meshStandardMaterial color="#A0916B" />
      </mesh>
      
      <mesh position={[2, -0.3, 0]}>
        <boxGeometry args={[0.8, 1.4, 0.8]} />
        <meshStandardMaterial color="#A0916B" />
      </mesh>
      
      {/* Detalles dorados */}
      <mesh position={[0, 0.5, 0.76]}>
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// Partículas flotantes del NOA
function FloatingParticles() {
  const particlesRef = useRef()
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  const particles = Array.from({ length: 50 }, (_, i) => (
    <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={[
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      ]}>
        <sphereGeometry args={[0.02 + Math.random() * 0.03]} />
        <meshStandardMaterial 
          color={Math.random() > 0.5 ? "#D4AF37" : "#F5E6D3"} 
          transparent 
          opacity={0.6}
        />
      </mesh>
    </Float>
  ))

  return <group ref={particlesRef}>{particles}</group>
}

// Componente principal del Hero 3D
function Scene() {
  return (
    <>
      {/* Iluminación */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#FFE5B4" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#D4AF37" />
      
      {/* Entorno */}
      <Environment preset="sunset" />
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
      
      {/* Hotel */}
      <HotelBuilding />
      
      {/* Partículas */}
      <FloatingParticles />
      
      {/* Texto 3D flotante */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, -3, 0]}
          fontSize={0.5}
          color="#D4AF37"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          Hotel Supai
        </Text>
      </Float>
      
      {/* Controles suaves */}
      <OrbitControls 
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

// Loading fallback
function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
    </div>
  )
}

export default function Hero3D() {
  const parallaxOffset = useParallax(0.1)
  const [isDesktop, setIsDesktop] = useState(false)
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Imagen de fondo del hotel con parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: parallaxOffset }}
      >
        <img
          src="/images/Hotel Supay.png"
          alt="Hotel Supay - Paisaje andino"
          className="w-full h-[120%] object-cover scale-105 transition-transform duration-[20s] ease-out"
        />
      </motion.div>
      
      {/* Overlays de gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      
      {/* Canvas 3D superpuesto - Solo en desktop para mejor performance */}
      {isDesktop && (
        <div className="absolute inset-0 opacity-40">
          <Canvas
            camera={{ position: [0, 2, 8], fov: 45 }}
            className="bg-transparent"
            performance={{ min: 0.5 }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="relative z-10 h-full flex items-center justify-center text-center section-padding">
        <div className="max-w-5xl mx-auto">
          <div className="fade-in-scale">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display mb-6 leading-[1.1] md:leading-[1.08] lg:leading-[1.06] pb-1 overflow-visible">
              <span className="block text-gradient bg-gradient-to-r from-pure via-cream to-pure bg-clip-text text-transparent drop-shadow-2xl">
                Hotel Supay
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-cream/90 fade-in-up stagger-1 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Una experiencia de lujo en el corazón del NOA, donde la elegancia se encuentra con la naturaleza ancestral.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up stagger-2">
              <a href="/reservas" className="btn-cta rounded-full pulse-glow hover-glow backdrop-blur-sm">
                Reservar Ahora
              </a>
              <a href="/habitaciones" className="btn-outline rounded-full hover-lift text-cream border-cream/70 bg-white/10 hover:bg-cream/15 backdrop-blur-sm">
                Explorar Suites
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 fade-in-up stagger-4 z-10">
        <div className="flex flex-col items-center gap-2 text-cream/70">
          <span className="text-sm tracking-widest font-medium">EXPLORAR</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent animate-pulse"></div>
        </div>
      </div>
      
      {/* Partículas flotantes decorativas */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold/30 rounded-full breathe z-5"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-copper/40 rounded-full breathe z-5" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-gold/20 rounded-full breathe z-5" style={{animationDelay: '2s'}}></div>
    </div>
  )
}
