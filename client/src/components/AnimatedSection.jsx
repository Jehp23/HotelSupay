import { motion } from 'framer-motion'
import { useIntersectionObserver } from '../hooks/useParallax'

const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const slideInLeft = {
  hidden: { 
    opacity: 0, 
    x: -100,
    rotate: -5
  },
  visible: { 
    opacity: 1, 
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
}

const slideInRight = {
  hidden: { 
    opacity: 0, 
    x: 100,
    rotate: 5
  },
  visible: { 
    opacity: 1, 
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
}

const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotate: -10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "backOut"
    }
  }
}

export function AnimatedSection({ 
  children, 
  animation = "fadeInUp", 
  className = "",
  threshold = 0.1,
  rootMargin = "50px",
  ...props 
}) {
  const [ref, isVisible] = useIntersectionObserver({ threshold, rootMargin })

  const animations = {
    fadeInUp,
    slideInLeft,
    slideInRight,
    scaleIn,
    staggerContainer
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={animations[animation]}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedText({ 
  text, 
  className = "",
  delay = 0,
  duration = 0.8 
}) {
  const [ref, isVisible] = useIntersectionObserver()

  const words = text.split(' ')

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={isVisible ? { 
            opacity: 1, 
            y: 0, 
            rotateX: 0,
            transition: {
              delay: delay + (i * 0.1),
              duration: duration,
              ease: [0.25, 0.46, 0.45, 0.94]
            }
          } : {}}
          className="inline-block mr-2"
          style={{ transformOrigin: 'center bottom' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}

export function AnimatedCounter({ 
  from = 0, 
  to, 
  duration = 2,
  className = "",
  suffix = ""
}) {
  const [ref, isVisible] = useIntersectionObserver()

  return (
    <motion.div
      ref={ref}
      className={className}
    >
      {isVisible && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            initial={{ textContent: from }}
            animate={{ textContent: to }}
            transition={{ 
              duration,
              ease: "easeOut"
            }}
          />
          {suffix}
        </motion.span>
      )}
    </motion.div>
  )
}
