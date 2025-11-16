import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Card3D({ children, className = "", intensity = 15, ...props }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (!isHovered) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const rotateXValue = ((e.clientY - centerY) / rect.height) * intensity
    const rotateYValue = ((centerX - e.clientX) / rect.width) * intensity
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
        z: isHovered ? 50 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Sombra dinámica */}
      <motion.div
        className="absolute inset-0 bg-black/20 blur-xl -z-10"
        animate={{
          x: -rotateY * 0.5,
          y: rotateX * 0.5,
          scale: isHovered ? 1.1 : 1,
          opacity: isHovered ? 0.3 : 0.1
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      />
      
      {/* Contenido */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          z: isHovered ? 20 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      >
        {children}
      </motion.div>
      
      {/* Brillo en hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent pointer-events-none rounded-inherit"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8
        }}
        transition={{
          duration: 0.3
        }}
      />
    </motion.div>
  )
}
