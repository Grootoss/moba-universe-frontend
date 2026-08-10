import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="layout layout--admin">
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  )
}
