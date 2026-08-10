import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { setLocale } from '../i18n'
import NotFoundPage from '../pages/NotFoundPage'
import { getStoredLang, localizePath, normalizeLang } from '../utils/lang'
import { isAdmin, isStaff, resolveAuthUser } from '../utils/adminAuth'

export function LangLayout() {
  const { lang } = useParams()
  const routeLang = normalizeLang(lang)

  useEffect(() => {
    if (routeLang) setLocale(routeLang)
  }, [routeLang])

  if (!routeLang) return <NotFoundPage />

  return <Outlet />
}

export function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation()
  return <Navigate to={`${localizePath(to)}${location.search}${location.hash}`} replace />
}

function AuthGate({
  check,
  redirectTo,
  children,
}: {
  check: (user: Awaited<ReturnType<typeof resolveAuthUser>>) => boolean
  redirectTo: (location: ReturnType<typeof useLocation>) => string
  children: ReactNode
}) {
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading')

  useEffect(() => {
    resolveAuthUser()
      .then((user) => setStatus(check(user) ? 'ok' : 'denied'))
      .catch(() => setStatus('denied'))
  }, [location.pathname])

  if (status === 'loading') return <div className="state">…</div>
  if (status === 'denied') return <Navigate to={redirectTo(location)} replace />
  return <>{children}</>
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const lang = normalizeLang(window.location.pathname.split('/')[1]) ?? getStoredLang()
  return (
    <AuthGate
      check={(user) => Boolean(user)}
      redirectTo={(location) =>
        `${localizePath('/login', lang)}?redirect=${encodeURIComponent(location.pathname + location.search)}`
      }
    >
      {children}
    </AuthGate>
  )
}

export function RequireStaff({ children }: { children: ReactNode }) {
  return (
    <AuthGate
      check={(user) => isStaff(user)}
      redirectTo={(location) =>
        `/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
      }
    >
      {children}
    </AuthGate>
  )
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return (
    <AuthGate
      check={(user) => isAdmin(user)}
      redirectTo={(location) =>
        `/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
      }
    >
      {children}
    </AuthGate>
  )
}
