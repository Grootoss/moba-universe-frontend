import { useLayoutEffect, useRef, useState } from 'react'

type Props = {
  src: string
  alt?: string
  width?: number
  height?: number
  className?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  onError?: () => void
}

export default function FadeImage({
  src,
  alt = '',
  width,
  height,
  className,
  loading = 'lazy',
  fetchPriority,
  onError,
}: Props) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useLayoutEffect(() => {
    setLoaded(false)
    const el = ref.current
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true)
  }, [src])

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={`fade-img${loaded ? ' is-loaded' : ''}${className ? ` ${className}` : ''}`}
      onLoad={() => setLoaded(true)}
      onError={onError}
    />
  )
}
