import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

// Elemento flotante individual
function FloatingElement({ delay = 0, duration = 3, children, className = "" }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        y: [-10, 10, -10],
        rotate: [-2, 2, -2],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// Partículas de fondo (reducidas para mejor performance)
export function BackgroundParticles({ count = 8 }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.3 + 0.1
    }))
    setParticles(newParticles)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {particles.map((particle) => (
        <FloatingElement
          key={particle.id}
          delay={particle.delay}
          duration={particle.duration}
          className="w-1 h-1 bg-gold/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity
          }}
        />
      ))}
    </div>
  )
}

// Elementos decorativos flotantes
export function FloatingDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Formas geométricas */}
      <FloatingElement delay={0} duration={4} className="top-1/4 left-1/4">
        <div className="w-8 h-8 border border-gold/20 rotate-45 rounded-sm" />
      </FloatingElement>
      
      <FloatingElement delay={1} duration={5} className="top-3/4 right-1/4">
        <div className="w-6 h-6 bg-gradient-to-br from-gold/10 to-copper/10 rounded-full" />
      </FloatingElement>
      
      <FloatingElement delay={2} duration={3.5} className="top-1/2 left-3/4">
        <div className="w-4 h-4 border-2 border-stone/10 rounded-full" />
      </FloatingElement>
      
      {/* Líneas decorativas */}
      <FloatingElement delay={0.5} duration={6} className="top-1/3 right-1/3">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </FloatingElement>
      
      <FloatingElement delay={2.5} duration={4.5} className="bottom-1/3 left-1/3">
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-copper/15 to-transparent rotate-45" />
      </FloatingElement>
    </div>
  )
}


export default FloatingElement
