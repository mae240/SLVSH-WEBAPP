import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useRounds } from '@/hooks/useRounds'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions, type PredictionWithProfile } from '@/hooks/usePredictions'
import { useAdminUpdatePrediction } from '@/hooks/useAdmin'
import { useAdminCreatePrediction } from '@/hooks/useAdminPredictions'
import { allLettersOptions } from '@/schemas/prediction'
import { lettersToDB, lettersToForm, lettersLabel } from '@/lib/letters'
import type { Database } from '@/types/database'

type Match = Database['public']['Tables']['matches']['Row']

export function AdminPredictionsPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>()

  const { data: tournament, isLoading: tLoading } = useQuery({
    queryKey: ['tournament-by-id', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
  })

  const { data: rounds, isLoading: rLoading } = useRounds(tournamentId)

  if (tLoading || rLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
      </div>
    )
  }

  if (!tournament) return <p className="text-red-400">Turnier nicht gefunden.</p>

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/admin/tournament/${tournament.id}`} className="text-sm text-gray-400 hover:text-gray-300">
          &larr; {tournament.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Alle Tipps verwalten</h1>
      </div>

      {rounds?.map((round) => (
        <RoundPredictions key={round.id} round={round} tournamentId={tournament.id} />
      ))}
    </div>
  )
}

function useAllProfiles() {
  return useQuery({
    queryKey: ['profiles-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name')
        .order('display_name')
      if (error) throw error
      return data
    },
  })
}

function RoundPredictions({ round, tournamentId }: {
  round: Database['public']['Tables']['rounds']['Row']
  tournamentId: string
}) {
  const { data: matches } = useMatches(round.id)
  const { data: predictions } = usePredictions(round.id)
  const { data: allProfiles } = useAllProfiles()
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-medium">{round.name}</span>
        <span className="text-gray-500">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && matches && predictions && allProfiles && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {allProfiles.map((profile) => (
            <UserPredictions
              key={profile.id}
              userId={profile.id}
              displayName={profile.display_name}
              matches={matches}
              predictions={predictions.filter((p) => p.user_id === profile.id)}
              roundId={round.id}
              tournamentId={tournamentId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function UserPredictions({ userId, displayName, matches, predictions, roundId, tournamentId }: {
  userId: string
  displayName: string
  matches: Match[]
  predictions: PredictionWithProfile[]
  roundId: string
  tournamentId: string
}) {
  const [expanded, setExpanded] = useState(false)
  const predByMatch = new Map(predictions.map((p) => [p.match_id, p]))
  const missingCount = matches.length - predictions.length

  return (
    <div className="rounded border border-gray-700 bg-gray-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
      >
        <span className="font-medium">{displayName}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{predictions.length}/{matches.length} Tipps</span>
          {missingCount > 0 && (
            <span className="rounded bg-yellow-600/20 px-1.5 py-0.5 text-[10px] text-yellow-400">
              {missingCount} fehlt
            </span>
          )}
          <span className="text-gray-500 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-700 px-3 py-2 space-y-1">
          {matches.map((match) => {
            const pred = predByMatch.get(match.id)
            return (
              <PredictionCell
                key={match.id}
                match={match}
                prediction={pred ?? null}
                userId={userId}
                roundId={roundId}
                tournamentId={tournamentId}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function PredictionCell({ match, prediction, userId, roundId, tournamentId }: {
  match: Match
  prediction: PredictionWithProfile | null
  userId: string
  roundId: string
  tournamentId: string
}) {
  const [editing, setEditing] = useState(false)
  const [winner, setWinner] = useState(prediction?.predicted_winner ?? match.player_a)
  const [letters, setLetters] = useState(lettersToForm(prediction?.predicted_winner_letters ?? null))

  const updatePrediction = useAdminUpdatePrediction()
  const createPrediction = useAdminCreatePrediction()

  const isPending = updatePrediction.isPending || createPrediction.isPending

  const handleSave = async () => {
    const lettersVal = lettersToDB(letters)
    if (prediction) {
      await updatePrediction.mutateAsync({
        id: prediction.id,
        roundId,
        predictedWinner: winner,
        predictedWinnerLetters: lettersVal,
      })
    } else {
      await createPrediction.mutateAsync({
        matchId: match.id,
        tournamentId,
        roundId,
        userId,
        predictedWinner: winner,
        predictedWinnerLetters: lettersVal,
      })
    }
    setEditing(false)
  }

  const matchLabel = `#${match.match_number} ${match.player_a} vs ${match.player_b}`

  if (!editing) {
    return (
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{matchLabel}</span>
        <div className="flex items-center gap-2">
          {prediction ? (
            <span className="text-gray-300">
              {prediction.predicted_winner} ({lettersLabel(prediction.predicted_winner_letters)})
            </span>
          ) : (
            <span className="text-yellow-500">—</span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-gray-600 hover:text-gray-200"
          >
            {prediction ? 'Edit' : 'Neu'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-gray-500 shrink-0">{matchLabel}</span>
      <div className="flex items-center gap-1">
        <select
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          className="rounded border border-gray-600 bg-gray-900 px-1.5 py-0.5 text-xs"
        >
          <option value={match.player_a}>{match.player_a}</option>
          <option value={match.player_b}>{match.player_b}</option>
        </select>
        <select
          value={letters}
          onChange={(e) => setLetters(e.target.value)}
          className="rounded border border-gray-600 bg-gray-900 px-1.5 py-0.5 text-xs"
        >
          {allLettersOptions.map((l) => (
            <option key={l} value={l}>{l === 'none' ? 'Keine' : l}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white disabled:opacity-50"
        >
          OK
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-gray-600"
        >
          X
        </button>
      </div>
    </div>
  )
}
