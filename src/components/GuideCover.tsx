import { useEffect, useMemo, useState, type ReactNode } from 'react'
import FadeImage from './FadeImage'
import { coverCandidateUrls, type CoverSlot } from '../utils/mediaUrl'

function currentSlot(): CoverSlot {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'desktop'
  if (window.matchMedia('(max-width: 767px)').matches) return 'mobile'
  if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet'
  return 'desktop'
}

function useCoverSlot(): CoverSlot {
  const [slot, setSlot] = useState<CoverSlot>(currentSlot)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)')
    const tablet = window.matchMedia('(max-width: 1023px)')
    const onChange = () => setSlot(currentSlot())
    mobile.addEventListener('change', onChange)
    tablet.addEventListener('change', onChange)
    return () => {
      mobile.removeEventListener('change', onChange)
      tablet.removeEventListener('change', onChange)
    }
  }, [])

  return slot
}

type Props = {
  cover?: string | null
  thumb?: string | null
  purpose?: 'list' | 'hero'
  alt?: string
  width?: number
  height?: number
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  frameClassName?: string
  fallback?: ReactNode
}

export default function GuideCover({
  cover,
  thumb,
  purpose = 'list',
  alt = '',
  width,
  height,
  loading = 'lazy',
  fetchPriority,
  frameClassName,
  fallback = null,
}: Props) {
  const slot = useCoverSlot()
  const candidates = useMemo(
    () => coverCandidateUrls(cover, thumb, slot, purpose),
    [cover, thumb, slot, purpose],
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [candidates])

  const src = candidates[index]
  if (!src) return <>{fallback}</>

  const image = (
    <FadeImage
      key={src}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => setIndex((current) => current + 1)}
    />
  )

  if (!frameClassName) return image
  return <div className={frameClassName}>{image}</div>
}
