import React from 'react'

// This component tries, in order:
// 1) WEBP (/logo-supay-luxury.webp)
// 2) PNG  (/logo-supay-luxury.png)
// 3) SVG  (/logo-supay.svg)
// So the logo always renders regardless of format/availability.
export default function Logo({ className = '', alt = 'Hotel Supay' }) {
  const handleError = (e) => {
    const el = e.currentTarget
    // If it's webp, try png
    if (!el.dataset.triedPng && el.src.includes('logo-supay-luxury.webp')) {
      el.dataset.triedPng = 'true'
      el.src = '/logo-supay-luxury.png'
      return
    }
    // If it's png (or webp failed and then png failed), fallback to svg
    if (!el.dataset.fallback) {
      el.dataset.fallback = 'true'
      el.src = '/logo-supay.svg'
    }
  }

  return (
    <img
      src="/logo-supay-luxury.webp"
      alt={alt}
      className={className}
      onError={handleError}
      loading="eager"
      decoding="sync"
    />
  )
}
