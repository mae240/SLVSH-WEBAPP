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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-brand" />
      </div>
    )
  }

  if (tError || !tournament) {
    return <p className="text-red-400">Tournament not found.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-gray-600 hover:text-brand transition">&larr; All Tournaments</Link>
        <h1 className="mt-2 text-2xl font-bold">{tournament.name}</h1>
        {tournament.description && (
          <p className="mt-1 text-gray-500">{tournament.description}</p>
        )}
      </div>

      <LeaderboardWidget tournamentId={tournament.id} slug={slug!} />

      {rounds && rounds.length > 0 && (
        <MyPredictionsWidget tournamentId={tournament.id} slug={slug!} rounds={rounds} />
      )}

      {!rounds?.length ? (
        <p className="text-gray-600">No rounds yet.</p>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Rounds</h2>
          {rounds.map((round) => {
            const isPast = round.deadline_at ? new Date(round.deadline_at) <= new Date() : false
            const isLocked = round.is_locked
            const isOpen = round.is_open
            return (
              <Link
                key={round.id}
                to={`/tournament/${slug}/round/${round.id}`}
                className="card block group transition hover:border-brand/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium group-hover:text-brand transition">{round.name}</span>
                  <div className="flex gap-2">
                    {isLocked && <span className="badge-red">Locked</span>}
                    {!isLocked && !isOpen && <span className="badge-gray">Draft</span>}
                    {!isLocked && isOpen && isPast && <span className="badge-yellow">Deadline passed</span>}
                    {!isLocked && isOpen && !isPast && <span className="badge-green">Open</span>}
                  </div>
                </div>
                {round.deadline_at && (
                  <p className="mt-1 text-sm text-gray-600">
                    Deadline: {new Date(round.deadline_at).toLocaleString('en-US')}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
