import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function Layout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-bold tracking-tight hover:text-gray-200">SLVSH Bets</Link>
            {profile?.is_admin && (
              <Link to="/admin" className="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-medium text-blue-400 hover:bg-blue-600/30">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{profile?.display_name}</span>
            <Link to="/settings" className="text-sm text-gray-400 hover:text-gray-200">
              Einstellungen
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
