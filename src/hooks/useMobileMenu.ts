import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { pathname } = useLocation()

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [close])

  return { isOpen, open, close, toggle }
}
