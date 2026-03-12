import { Link } from 'react-router-dom'
import { useTournaments } from '@/hooks/useTournaments'

export function DashboardPage() {
  const { data: tournaments, isLoading, error } = useTournaments()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-400">Fehler beim Laden der Turniere.</p>
  }

  if (!tournaments?.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Turniere</h1>
        <p className="text-gray-400">Noch keine Turniere vorhanden.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Turniere</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {tournaments.map((t) => (
          <Link
            key={t.id}
            to={`/tournament/${t.slug}`}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700"
          >
            <h2 className="text-lg font-semibold">{t.name}</h2>
            {t.description && (
              <p className="mt-1 text-sm text-gray-400">{t.description}</p>
            )}
            <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${
              t.status === 'active'
                ? 'bg-green-600/20 text-green-400'
                : 'bg-gray-600/20 text-gray-400'
            }`}>
              {t.status === 'active' ? 'Aktiv' : 'Beendet'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
