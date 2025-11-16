export default function Picture({ src, alt = '', className = '', loading }) {
  const webp = src.replace(/\.(png|jpg|jpeg)$/i, '.webp')
  return (
    <picture>
      <source type="image/webp" srcSet={webp} />
      <img src={src} alt={alt} className={className} loading={loading} />
    </picture>
  )
}
