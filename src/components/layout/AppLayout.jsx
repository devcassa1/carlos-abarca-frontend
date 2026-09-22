import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/lotes', label: 'Lotes' },
  { to: '/cultivos', label: 'Cultivos' },
  { to: '/labores', label: 'Labores' },
  { to: '/reportes', label: 'Reportes' },
]

function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-panel">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-ink ring-1 ring-line-soft">
            CA
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-ink'
                    : 'text-muted hover:bg-panel-2 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg bg-panel-2 px-3 py-2 text-sm font-medium text-soft transition-colors hover:bg-danger/10 hover:text-danger-ink"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout