import { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import CookieBanner from './components/CookieBanner'
import { useSeoRoute } from './hooks/useSeoRoute'
import { isPrerender } from './utils/prerender'
import { trackPageHit } from './utils/metrika'

const PRIVATE_ROUTE_SUFFIXES = new Set(['login', 'register', 'profile'])

export default function App() {
  const location = useLocation()
  const { lang } = useParams()

  const isAdminLayout = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login'

  const blockIndexing = useMemo(() => {
    if (isAdminLayout) return true
    if (/^\/(ru|en)\/user\/[^/]+/.test(location.pathname)) return true
    const parts = location.pathname.split('/').filter(Boolean)
    const routeTail = parts[parts.length - 1]
    if (location.pathname === '/404' || parts.length === 0) return false
    return PRIVATE_ROUTE_SUFFIXES.has(routeTail) || location.pathname.includes('/profile')
  }, [location.pathname, isAdminLayout])

  useSeoRoute()

  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (!robots) {
      robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      document.head.appendChild(robots)
    }
    robots.setAttribute(
      'content',
      blockIndexing
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )
  }, [blockIndexing])

  useEffect(() => {
    if (isPrerender()) return
    const url = `${window.location.origin}${location.pathname}${location.search}`
    queueMicrotask(() => trackPageHit(url, document.title))
  }, [location.pathname, location.search, lang])

  return (
    <div className={`layout${isAdminLayout ? ' layout--admin' : ''}`}>
      {!isAdminLayout ? <AppHeader /> : null}
      <main className="layout__main">
        <Outlet />
      </main>
      {!isAdminLayout ? <AppFooter /> : null}
      {!isAdminLayout ? <CookieBanner /> : null}
    </div>
  )
}
