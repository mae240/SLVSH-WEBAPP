import { Link } from 'react-router-dom'
import { useTournaments } from '@/hooks/useTournaments'

export function DashboardPage() {
  const { data: tournaments, isLoading, error } = useTournaments()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-brand" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-400">Failed to load tournaments.</p>
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <img src="/logo.png" alt="SLVSH Bets" className="mx-auto w-full max-w-[280px] drop-shadow-[0_0_20px_rgba(34,197,94,0.25)]" />
        <h1 className="text-2xl font-bold tracking-tight">Tournaments</h1>
      </div>

      {!tournaments?.length ? (
        <p className="text-center text-gray-600">No tournaments yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/tournament/${t.slug}`}
              className="card group transition hover:border-brand/30"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold group-hover:text-brand transition">{t.name}</h2>
                <span className={t.status === 'active' ? 'badge-green' : 'badge-gray'}>
                  {t.status === 'active' ? 'Live' : 'Finished'}
                </span>
              </div>
              {t.description && (
                <p className="mt-2 text-sm text-gray-600">{t.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
