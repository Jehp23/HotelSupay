import { useEffect, useRef, useState } from 'react'
import Picture from './Picture'

export default function Carousel({ items = [], auto = true, interval = 5000, onSlideClick }) {
  const [index, setIndex] = useState(0)
  const timer = useRef(null)
  const touchStartX = useRef(null)

  const go = (i) => setIndex((prev) => (i + items.length) % items.length)
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  useEffect(() => {
    if (!auto || items.length <= 1) return
    timer.current && clearInterval(timer.current)
    timer.current = setInterval(next, interval)
    return () => timer.current && clearInterval(timer.current)
  }, [index, auto, interval, items.length])

  const onTouchStart = (e) => { touchStartX.current = e.touches?.[0]?.clientX ?? null }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = (e.changedTouches?.[0]?.clientX ?? 0) - touchStartX.current
    if (dx > 40) prev()
    if (dx < -40) next()
    touchStartX.current = null
  }

  if (!items.length) return null

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-2xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full h-64 md:h-80">
          {items.map((it, i) => (
            <button
              key={it.src}
              aria-label={it.alt || it.caption || 'imagen'}
              onClick={() => onSlideClick?.(i)}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <Picture src={it.src} alt={it.alt || ''} className="w-full h-full object-cover" />
              {it.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone/70 to-transparent p-4">
                  <p className="font-display text-cream text-lg">{it.caption}</p>
                  {it.desc && <p className="text-cream/80 text-sm">{it.desc}</p>}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      {items.length > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-stone/60 text-pure rounded-full w-9 h-9 hover:bg-stone hidden md:inline-flex items-center justify-center"
          >
            ‹
          </button>
          <button
            aria-label="Siguiente"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-stone/60 text-pure rounded-full w-9 h-9 hover:bg-stone hidden md:inline-flex items-center justify-center"
          >
            ›
          </button>
          <div className="flex gap-2 justify-center mt-3">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir a ${i + 1}`}
                onClick={() => go(i)}
                className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-stone' : 'bg-stone/30 hover:bg-stone/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
