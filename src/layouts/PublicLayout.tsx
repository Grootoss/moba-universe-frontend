import { Outlet } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import AppFooter from '../components/AppFooter'
import CookieBanner from '../components/CookieBanner'

export default function PublicLayout() {
  return (
    <div className="layout">
      <AppHeader />
      <main className="layout__main">
        <Outlet />
      </main>
      <AppFooter />
      <CookieBanner />
    </div>
  )
}
