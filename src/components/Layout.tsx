import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function Layout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-gray-800/60 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <img src="/logo.png" alt="SLVSH Bets" className="h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
            </Link>
            {profile?.is_admin && (
              <Link to="/admin" className="badge-brand text-[10px] uppercase tracking-wider">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{profile?.display_name}</span>
            <Link to="/settings" className="text-gray-500 hover:text-brand transition" title="Settings">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
            </Link>
            <button
              onClick={signOut}
              className="text-gray-500 hover:text-red-400 transition"
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
