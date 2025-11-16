import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Logo from './Logo'

export default function LoadingScreen({ isLoading, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [showLogo, setShowLogo] = useState(false)

  useEffect(() => {
    if (!isLoading) return

    // Simular carga progresiva
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onComplete?.()
          }, 800)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 150)

    // Mostrar logo después de un momento
    const logoTimer = setTimeout(() => setShowLogo(true), 300)

    return () => {
      clearInterval(interval)
      clearTimeout(logoTimer)
    }
  }, [isLoading, onComplete])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-stone via-cactus/20 to-sage/30"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
        >
          {/* Partículas de fondo (reducidas) */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gold/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            {/* Logo animado */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0, 
                    opacity: 1,
                    transition: { 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 20,
                      duration: 1
                    }
                  }}
                  className="mb-8"
                >
                  <div className="relative">
                    <Logo
                      className="h-24 w-auto mx-auto filter drop-shadow-2xl"
                      alt="Hotel Supay"
                    />
                    {/* Brillo dorado */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/30 to-transparent"
                      animate={{
                        x: [-100, 100],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 1
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Texto elegante */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mb-12"
            >
              <h1 className="font-display text-4xl md:text-5xl text-cream mb-2 tracking-wider">
                Hotel Supay
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-gold">◆</span>
                <span className="text-gold">◆</span>
                <span className="text-gold">◆</span>
              </div>
              <p className="text-cream/80 text-lg tracking-widest">
                LUXURY RETREAT
              </p>
            </motion.div>

            {/* Barra de progreso premium */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="relative mx-auto"
            >
              <div className="w-48 h-1 bg-cream/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold via-copper to-gold rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              
              {/* Porcentaje */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-4 text-cream/60 text-sm tracking-widest"
              >
                {Math.round(progress)}%
              </motion.div>
            </motion.div>

            {/* Texto de carga */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-8 text-cream/50 text-sm tracking-widest"
            >
              Preparando tu experiencia...
            </motion.p>
          </div>

          {/* Efecto de brillo de fondo */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-copper/5"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
