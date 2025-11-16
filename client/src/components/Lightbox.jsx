import { useEffect, useRef } from 'react'

export default function Lightbox({ items = [], index = 0, onClose, onPrev, onNext }) {
  const current = items[index]
  const touchStartX = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  if (!current) return null

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = (e.changedTouches?.[0]?.clientX ?? 0) - touchStartX.current
    if (dx > 40) onPrev?.()
    if (dx < -40) onNext?.()
    touchStartX.current = null
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Click anywhere on backdrop to close */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative max-w-5xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <img src={current.src} alt={current.alt || ''} className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
          {current.caption && (
            <div className="mt-3 text-center text-cream">
              <p className="font-display text-xl">{current.caption}</p>
              {current.desc && <p className="text-cream/80 mt-1">{current.desc}</p>}
            </div>
          )}
          <button aria-label="Cerrar" onClick={onClose} className="absolute -top-3 -right-3 bg-stone text-pure rounded-full w-10 h-10 hover:bg-cactus">✕</button>
          {index > 0 && (
            <button aria-label="Anterior" onClick={onPrev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-stone/70 text-pure rounded-full w-10 h-10 hover:bg-stone">‹</button>
          )}
          {index < items.length - 1 && (
            <button aria-label="Siguiente" onClick={onNext} className="absolute right-0 top-1/2 -translate-y-1/2 bg-stone/70 text-pure rounded-full w-10 h-10 hover:bg-stone">›</button>
          )}
        </div>
      </div>
    </div>
  )
}
