import { useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

export function SmoothScrollProvider({ children }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    // Deshabilitamos el smooth scroll personalizado que estaba causando lag
    // El navegador maneja mejor el scroll nativo
    return
  }, [])

  return <div ref={scrollRef}>{children}</div>
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-copper to-gold z-50 origin-left"
      style={{ scaleX }}
    />
  )
}

export function ParallaxSection({ 
  children, 
  speed = 0.5, 
  className = "",
  offset = 0 
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [offset, offset + speed * 100])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}

export function ScrollTrigger({ 
  children, 
  animation = "fadeInUp",
  threshold = 0.1,
  className = ""
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.2"]
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [50, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1])

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
