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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
      </div>
    )
  }

  if (!round || !matches) {
    return <p className="text-red-400">Runde nicht gefunden.</p>
  }

  const isPast = round.deadline_at ? new Date(round.deadline_at) <= new Date() : false
  const isLocked = round.is_locked
  const isOpen = round.is_open
  const canEdit = isOpen && !isPast && !isLocked
  const isAdmin = profile?.is_admin ?? false
  const showOtherPredictions = isLocked || isAdmin

  const predsByMatch = groupPredictionsByMatch(predictions ?? [])

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/tournament/${slug}`} className="text-sm text-gray-400 hover:text-gray-300">
          &larr; {tournament?.name ?? 'Zurück'}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{round.name}</h1>

        {canEdit && round.deadline_at && (
          <div className="mt-2">
            <Countdown deadline={round.deadline_at} />
          </div>
        )}

        {!canEdit && (
          <p className="mt-2 text-sm text-yellow-400">
            {isLocked
              ? 'Runde ist gesperrt — keine Änderungen möglich.'
              : !isOpen
                ? 'Runde ist noch nicht freigegeben — Tipps können noch nicht abgegeben werden.'
                : 'Deadline ist vorbei — keine Änderungen möglich.'}
          </p>
        )}
      </div>

      {!matches.length ? (
        <p className="text-gray-400">Noch keine Matches in dieser Runde.</p>
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
