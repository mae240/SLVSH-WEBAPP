import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Database, WinnerLetters } from '@/types/database'

type RoundRow = Database['public']['Tables']['rounds']['Row']
type MatchRow = Database['public']['Tables']['matches']['Row']

interface PredictionRow {
  id: string
  match_id: string
  round_id: string
  predicted_winner: string
  predicted_winner_letters: WinnerLetters | null
}

interface Props {
  tournamentId: string
  slug: string
  rounds: RoundRow[]
}

function useMyPredictions(tournamentId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['my-predictions', tournamentId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('id, match_id, round_id, predicted_winner, predicted_winner_letters')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId!)
      if (error) throw error
      return data as PredictionRow[]
    },
    enabled: !!userId,
  })
}

function useAllMatches(tournamentId: string) {
  return useQuery({
    queryKey: ['matches-tournament', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('match_number')
      if (error) throw error
      return data as MatchRow[]
    },
  })
}

export function MyPredictionsWidget({ tournamentId, slug, rounds }: Props) {
  const { user } = useAuth()
  const { data: predictions, isLoading: predsLoading } = useMyPredictions(tournamentId, user?.id)
  const { data: matches, isLoading: matchesLoading } = useAllMatches(tournamentId)

  if (!user) return null
  if (predsLoading || matchesLoading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <h2 className="text-lg font-semibold">Meine Tipps</h2>
        <div className="mt-3 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
        </div>
      </div>
    )
  }

  const predsByRound = new Map<string, PredictionRow[]>()
  for (const p of predictions ?? []) {
    const list = predsByRound.get(p.round_id) ?? []
    list.push(p)
    predsByRound.set(p.round_id, list)
  }

  const matchesByRound = new Map<string, MatchRow[]>()
  for (const m of matches ?? []) {
    const list = matchesByRound.get(m.round_id) ?? []
    list.push(m)
    matchesByRound.set(m.round_id, list)
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold">Meine Tipps</h2>

      {!rounds.length ? (
        <p className="mt-2 text-sm text-gray-500">Noch keine Runden.</p>
      ) : (
        <div className="mt-3 space-y-4">
          {rounds.map((round) => {
            const roundMatches = matchesByRound.get(round.id) ?? []
            const roundPreds = predsByRound.get(round.id) ?? []
            const predsMap = new Map(roundPreds.map((p) => [p.match_id, p]))

            if (!round.is_open && !round.is_locked) {
              return (
                <div key={round.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-400">{round.name}</span>
                    <span className="rounded bg-gray-600/20 px-2 py-0.5 text-xs text-gray-500">
                      Vorbereitung
                    </span>
                  </div>
                </div>
              )
            }

            const tippCount = roundPreds.length
            const matchCount = roundMatches.length
            const isOpen = round.is_open && !round.is_locked && new Date(round.deadline_at) > new Date()

            return (
              <div key={round.id}>
                <div className="flex items-center justify-between">
                  <Link
                    to={`/tournament/${slug}/round/${round.id}`}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    {round.name}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {tippCount}/{matchCount} getippt
                  </span>
                </div>

                {roundMatches.length === 0 ? (
                  <p className="mt-1 text-xs text-gray-600">Noch keine Matches.</p>
                ) : (
                  <div className="mt-1 space-y-0.5">
                    {roundMatches.map((match) => {
                      const pred = predsMap.get(match.id)
                      return (
                        <div key={match.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            {match.player_a} vs {match.player_b}
                          </span>
                          {pred ? (
                            <span className="text-gray-300">
                              {pred.predicted_winner}
                              {pred.predicted_winner_letters && (
                                <span className="ml-1 text-gray-500">({pred.predicted_winner_letters})</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-600">
                              {isOpen ? '— offen' : '—'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
