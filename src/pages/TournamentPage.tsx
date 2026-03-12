import { useParams, Link } from 'react-router-dom'
import { useTournament } from '@/hooks/useTournaments'
import { useRounds } from '@/hooks/useRounds'
import { LeaderboardWidget } from '@/components/LeaderboardWidget'
import { MyPredictionsWidget } from '@/components/MyPredictionsWidget'

export function TournamentPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: tournament, isLoading: tLoading, error: tError } = useTournament(slug!)
  const { data: rounds, isLoading: rLoading } = useRounds(tournament?.id)

  if (tLoading || rLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
      </div>
    )
  }

  if (tError || !tournament) {
    return <p className="text-red-400">Turnier nicht gefunden.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-300">&larr; Alle Turniere</Link>
        <h1 className="mt-2 text-2xl font-bold">{tournament.name}</h1>
        {tournament.description && (
          <p className="mt-1 text-gray-400">{tournament.description}</p>
        )}
      </div>

      <LeaderboardWidget tournamentId={tournament.id} slug={slug!} />

      {rounds && rounds.length > 0 && (
        <MyPredictionsWidget tournamentId={tournament.id} slug={slug!} rounds={rounds} />
      )}

      {!rounds?.length ? (
        <p className="text-gray-400">Noch keine Runden vorhanden.</p>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Runden</h2>
          {rounds.map((round) => {
            const isPast = new Date(round.deadline_at) <= new Date()
            const isLocked = round.is_locked
            const isOpen = round.is_open
            return (
              <Link
                key={round.id}
                to={`/tournament/${slug}/round/${round.id}`}
                className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{round.name}</span>
                  <div className="flex gap-2">
                    {isLocked && (
                      <span className="rounded bg-red-600/20 px-2 py-0.5 text-xs text-red-400">
                        Gesperrt
                      </span>
                    )}
                    {!isLocked && !isOpen && (
                      <span className="rounded bg-gray-600/20 px-2 py-0.5 text-xs text-gray-400">
                        Vorbereitung
                      </span>
                    )}
                    {!isLocked && isOpen && isPast && (
                      <span className="rounded bg-yellow-600/20 px-2 py-0.5 text-xs text-yellow-400">
                        Deadline vorbei
                      </span>
                    )}
                    {!isLocked && isOpen && !isPast && (
                      <span className="rounded bg-green-600/20 px-2 py-0.5 text-xs text-green-400">
                        Offen
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Deadline: {new Date(round.deadline_at).toLocaleString('de-DE')}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
