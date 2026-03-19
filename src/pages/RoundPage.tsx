import { useParams, Link } from 'react-router-dom'
import { useRound } from '@/hooks/useRounds'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions, useScoredPredictions, groupPredictionsByMatch } from '@/hooks/usePredictions'
import { useTournament } from '@/hooks/useTournaments'
import { useAuth } from '@/hooks/useAuth'
import { MatchPredictionCard } from '@/components/MatchPredictionCard'
import { Countdown } from '@/components/Countdown'

export function RoundPage() {
  const { slug, roundId } = useParams<{ slug: string; roundId: string }>()
  const { user, profile } = useAuth()
  const { data: tournament } = useTournament(slug!)
  const { data: round, isLoading: roundLoading } = useRound(roundId)
  const { data: matches, isLoading: matchesLoading } = useMatches(roundId)
  const { data: predictions, isLoading: predsLoading } = usePredictions(roundId)
  const { data: scoredPredictions } = useScoredPredictions(roundId)

  if (roundLoading || matchesLoading || predsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-brand" />
      </div>
    )
  }

  if (!round || !matches) {
    return <p className="text-red-400">Round not found.</p>
  }

  const isLocked = round.is_locked
  const isOpen = round.is_open
  const canEdit = isOpen && !isLocked
  const showOtherPredictions = isLocked

  const predsByMatch = groupPredictionsByMatch(predictions ?? [])

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/tournament/${slug}`} className="text-sm text-gray-600 hover:text-brand transition">
          &larr; {tournament?.name ?? 'Back'}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{round.name}</h1>

        {canEdit && round.deadline_at && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">Deadline in</span>
            <Countdown deadline={round.deadline_at} />
          </div>
        )}

        {!canEdit && (
          <p className="mt-2 text-sm text-yellow-400/80">
            {isLocked
              ? 'Round is locked — no changes allowed.'
              : 'Round is not open yet — predictions cannot be placed.'}
          </p>
        )}
      </div>

      {!matches.length ? (
        <p className="text-gray-600">No matches in this round yet.</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const matchPreds = predsByMatch.get(match.id) ?? []
            const hidePredictions = !isOpen && !isLocked
            const myPrediction = hidePredictions ? undefined : matchPreds.find((p) => p.user_id === user?.id)
            const otherPredictions = showOtherPredictions && !hidePredictions
              ? matchPreds.filter((p) => p.user_id !== user?.id)
              : []

            const matchScored = scoredPredictions?.filter((sp) => sp.match_id === match.id) ?? []

            return (
              <MatchPredictionCard
                key={match.id}
                match={match}
                myPrediction={myPrediction}
                otherPredictions={otherPredictions}
                canEdit={canEdit}
                tournamentId={tournament?.id ?? ''}
                roundId={round.id}
                userId={user?.id ?? ''}
                scoredPredictions={matchScored}
                userDisplayName={profile?.display_name}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
