import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Database } from '@/types/database'
import { useUpsertPrediction, type PredictionWithProfile } from '@/hooks/usePredictions'
import { predictionSchema, type PredictionFormData, allLettersOptions } from '@/schemas/prediction'
import { lettersToDB, lettersToForm, lettersLabel } from '@/lib/letters'

type Match = Database['public']['Tables']['matches']['Row']
type ScoredPrediction = Database['public']['Views']['scored_predictions']['Row']

interface Props {
  match: Match
  myPrediction: PredictionWithProfile | undefined
  otherPredictions: PredictionWithProfile[]
  canEdit: boolean
  tournamentId: string
  roundId: string
  userId: string
  scoredPredictions?: ScoredPrediction[]
  userDisplayName?: string
}

export function MatchPredictionCard({
  match,
  myPrediction,
  otherPredictions,
  canEdit,
  tournamentId,
  roundId,
  userId,
  scoredPredictions,
  userDisplayName,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const upsertPrediction = useUpsertPrediction()

  const showForm = canEdit && (isEditing || !myPrediction)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionSchema),
    defaultValues: myPrediction
      ? {
          predicted_winner: myPrediction.predicted_winner,
          predicted_winner_letters: lettersToForm(myPrediction.predicted_winner_letters) as PredictionFormData['predicted_winner_letters'],
        }
      : undefined,
  })

  const onSubmit = async (data: PredictionFormData) => {
    await upsertPrediction.mutateAsync({
      matchId: match.id,
      tournamentId,
      roundId,
      userId,
      predictedWinner: data.predicted_winner,
      predictedWinnerLetters: lettersToDB(data.predicted_winner_letters),
      existingPredictionId: myPrediction?.id,
    })
    setIsEditing(false)
  }

  // Build scored lookup: predictionId -> scored row
  const scoreMap = new Map<string, ScoredPrediction>()
  scoredPredictions?.forEach((sp) => scoreMap.set(sp.id, sp))

  // All predictions for the table (my prediction first, then others)
  const allPredictions: PredictionWithProfile[] = []
  if (myPrediction) allPredictions.push(myPrediction)
  allPredictions.push(...otherPredictions)

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      {/* Match header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          <span className="text-gray-500">#{match.match_number}</span>{' '}
          {match.player_a} vs {match.player_b}
        </h3>
        {match.is_finished && match.winner ? (
          <span className="rounded bg-green-600/20 px-2 py-0.5 text-xs font-medium text-green-400">
            {match.winner} ({lettersLabel(match.winner_letters)})
          </span>
        ) : (
          <span className="rounded bg-gray-700/50 px-2 py-0.5 text-xs text-gray-500">Offen</span>
        )}
      </div>

      {/* Prediction form (when editing or no prediction yet) */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Gewinner</label>
            <div className="flex gap-2">
              {[match.player_a, match.player_b].map((player) => (
                <label key={player} className="flex-1">
                  <input
                    type="radio"
                    value={player}
                    {...register('predicted_winner')}
                    className="peer sr-only"
                  />
                  <div className="cursor-pointer rounded-lg border border-gray-700 px-3 py-2 text-center text-sm transition peer-checked:border-blue-500 peer-checked:bg-blue-600/10 peer-checked:text-blue-400 hover:border-gray-600">
                    {player}
                  </div>
                </label>
              ))}
            </div>
            {errors.predicted_winner && (
              <p className="mt-1 text-sm text-red-400">{errors.predicted_winner.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">Buchstaben des Gewinners</label>
            <div className="flex gap-2">
              {allLettersOptions.map((letters) => (
                <label key={letters} className="flex-1">
                  <input
                    type="radio"
                    value={letters}
                    {...register('predicted_winner_letters')}
                    className="peer sr-only"
                  />
                  <div className="cursor-pointer rounded-lg border border-gray-700 px-3 py-2 text-center text-sm transition peer-checked:border-blue-500 peer-checked:bg-blue-600/10 peer-checked:text-blue-400 hover:border-gray-600">
                    {letters === 'none' ? 'Keine' : letters}
                  </div>
                </label>
              ))}
            </div>
            {errors.predicted_winner_letters && (
              <p className="mt-1 text-sm text-red-400">{errors.predicted_winner_letters.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={upsertPrediction.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {upsertPrediction.isPending ? 'Speichern…' : 'Tipp abgeben'}
            </button>
            {myPrediction && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-gray-300"
              >
                Abbrechen
              </button>
            )}
          </div>

          {upsertPrediction.isError && (
            <p className="text-sm text-red-400">Fehler beim Speichern.</p>
          )}
        </form>
      )}

      {/* Predictions table */}
      {allPredictions.length > 0 && !showForm && (
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50 text-left text-xs text-gray-500">
                <th className="px-3 py-2 font-medium">Spieler</th>
                <th className="px-3 py-2 font-medium">Winner</th>
                <th className="px-3 py-2 font-medium">Letters</th>
                <th className="px-3 py-2 text-right font-medium">Punkte</th>
              </tr>
            </thead>
            <tbody>
              {allPredictions.map((p) => {
                const isMe = p.user_id === userId
                const scored = scoreMap.get(p.id)
                const points = scored?.total_points ?? null
                const winnerCorrect = scored ? scored.winner_points > 0 : null
                const lettersCorrect = scored ? scored.letters_points > 0 : null

                return (
                  <tr
                    key={p.id}
                    className={
                      isMe
                        ? 'bg-orange-500/10 border-b border-orange-500/20'
                        : 'border-b border-gray-800/50 hover:bg-gray-800/30'
                    }
                  >
                    <td className={`px-3 py-2 font-medium ${isMe ? 'text-orange-400' : 'text-gray-300'}`}>
                      {isMe ? `${userDisplayName ?? p.profiles.display_name} (du)` : p.profiles.display_name}
                    </td>
                    <td className="px-3 py-2">
                      <span className={
                        match.is_finished
                          ? winnerCorrect ? 'text-green-400' : 'text-red-400'
                          : 'text-gray-300'
                      }>
                        {p.predicted_winner}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={
                        match.is_finished
                          ? lettersCorrect ? 'text-green-400' : 'text-red-400'
                          : 'text-gray-300'
                      }>
                        {lettersLabel(p.predicted_winner_letters)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {match.is_finished && points !== null ? (
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                          points === 3 ? 'bg-green-600/20 text-green-400'
                          : points === 1 ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-gray-700/50 text-gray-500'
                        }`}>
                          {points}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    {isMe && canEdit && (
                      <td className="px-2 py-2">
                        <button
                          onClick={() => {
                            reset({
                              predicted_winner: myPrediction!.predicted_winner,
                              predicted_winner_letters: lettersToForm(myPrediction!.predicted_winner_letters) as PredictionFormData['predicted_winner_letters'],
                            })
                            setIsEditing(true)
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Ändern
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* No prediction yet, not editing */}
      {!myPrediction && !showForm && (
        <p className="mt-3 text-sm text-gray-500">Kein Tipp abgegeben.</p>
      )}
    </div>
  )
}
