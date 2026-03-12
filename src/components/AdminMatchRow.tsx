import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Database } from '@/types/database'
import { type PredictionWithProfile } from '@/hooks/usePredictions'
import { useUpdateMatch, useAdminUpdatePrediction } from '@/hooks/useAdmin'
import { resultSchema, type ResultFormData } from '@/schemas/admin'
import { allLettersOptions } from '@/schemas/prediction'
import { lettersToDB, lettersToForm, lettersLabel } from '@/lib/letters'

type Match = Database['public']['Tables']['matches']['Row']

interface Props {
  match: Match
  predictions: PredictionWithProfile[]
  roundId: string
}

function AdminPredictionRow({ prediction, match, roundId }: {
  prediction: PredictionWithProfile
  match: Match
  roundId: string
}) {
  const [editing, setEditing] = useState(false)
  const updatePrediction = useAdminUpdatePrediction()

  const { register, handleSubmit } = useForm({
    defaultValues: {
      predicted_winner: prediction.predicted_winner,
      predicted_winner_letters: lettersToForm(prediction.predicted_winner_letters),
    },
  })

  const onSave = async (data: { predicted_winner: string; predicted_winner_letters: string }) => {
    await updatePrediction.mutateAsync({
      id: prediction.id,
      roundId,
      predictedWinner: data.predicted_winner,
      predictedWinnerLetters: lettersToDB(data.predicted_winner_letters),
    })
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{prediction.profiles.display_name}</span>
        <div className="flex items-center gap-2">
          <span>{prediction.predicted_winner} ({lettersLabel(prediction.predicted_winner_letters)})</span>
          <button
            onClick={() => setEditing(true)}
            className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-gray-600 hover:text-gray-200"
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex items-center justify-between gap-2 text-xs">
      <span className="text-gray-400">{prediction.profiles.display_name}</span>
      <div className="flex items-center gap-1">
        <select {...register('predicted_winner')} className="rounded border border-gray-600 bg-gray-900 px-1.5 py-0.5 text-xs">
          <option value={match.player_a}>{match.player_a}</option>
          <option value={match.player_b}>{match.player_b}</option>
        </select>
        <select {...register('predicted_winner_letters')} className="rounded border border-gray-600 bg-gray-900 px-1.5 py-0.5 text-xs">
          {allLettersOptions.map((l) => <option key={l} value={l}>{l === 'none' ? 'Keine' : l}</option>)}
        </select>
        <button type="submit" disabled={updatePrediction.isPending} className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white disabled:opacity-50">
          OK
        </button>
        <button type="button" onClick={() => setEditing(false)} className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-gray-600">
          X
        </button>
      </div>
    </form>
  )
}

export function AdminMatchRow({ match, predictions, roundId }: Props) {
  const [showResult, setShowResult] = useState(false)
  const [showPreds, setShowPreds] = useState(false)
  const updateMatch = useUpdateMatch()

  const { register, handleSubmit, formState: { errors } } = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: match.is_finished
      ? { winner: match.winner ?? '', winner_letters: lettersToForm(match.winner_letters) as ResultFormData['winner_letters'] }
      : undefined,
  })

  const onSubmitResult = async (data: ResultFormData) => {
    await updateMatch.mutateAsync({
      id: match.id,
      roundId,
      winner: data.winner,
      winner_letters: lettersToDB(data.winner_letters),
      is_finished: true,
    })
    setShowResult(false)
  }

  return (
    <div className="rounded border border-gray-700 bg-gray-800 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">
          <span className="text-gray-500">#{match.match_number}</span>{' '}
          {match.player_a} vs {match.player_b}
        </span>
        <div className="flex items-center gap-2">
          {match.is_finished ? (
            <span className="text-xs text-green-400">
              {match.winner} ({lettersLabel(match.winner_letters)})
            </span>
          ) : (
            <span className="text-xs text-gray-500">Offen</span>
          )}
          <button
            onClick={() => setShowResult(!showResult)}
            className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-600"
          >
            Ergebnis
          </button>
          <button
            onClick={() => setShowPreds(!showPreds)}
            className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-600"
          >
            Tipps ({predictions.length})
          </button>
        </div>
      </div>

      {showResult && (
        <form onSubmit={handleSubmit(onSubmitResult)} className="mt-2 flex items-end gap-2">
          <div>
            <label className="block text-xs text-gray-500">Gewinner</label>
            <select {...register('winner')} className="mt-0.5 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm">
              <option value="">—</option>
              <option value={match.player_a}>{match.player_a}</option>
              <option value={match.player_b}>{match.player_b}</option>
            </select>
            {errors.winner && <p className="text-xs text-red-400">{errors.winner.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500">Buchstaben</label>
            <select {...register('winner_letters')} className="mt-0.5 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm">
              <option value="">—</option>
              {allLettersOptions.map((l) => <option key={l} value={l}>{l === 'none' ? 'Keine' : l}</option>)}
            </select>
            {errors.winner_letters && <p className="text-xs text-red-400">{errors.winner_letters.message}</p>}
          </div>
          <button type="submit" disabled={updateMatch.isPending} className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50">
            Speichern
          </button>
        </form>
      )}

      {showPreds && predictions.length > 0 && (
        <div className="mt-2 space-y-1">
          {predictions.map((p) => (
            <AdminPredictionRow key={p.id} prediction={p} match={match} roundId={roundId} />
          ))}
        </div>
      )}
      {showPreds && predictions.length === 0 && (
        <p className="mt-2 text-xs text-gray-500">Keine Tipps.</p>
      )}
    </div>
  )
}
