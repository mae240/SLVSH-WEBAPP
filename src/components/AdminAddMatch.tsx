import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateMatch } from '@/hooks/useAdmin'
import { matchSchema, type MatchFormData } from '@/schemas/admin'

interface Props {
  tournamentId: string
  roundId: string
  nextNumber: number
}

export function AdminAddMatch({ tournamentId, roundId, nextNumber }: Props) {
  const [showForm, setShowForm] = useState(false)
  const createMatch = useCreateMatch()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: { match_number: nextNumber },
  })

  const onSubmit = async (data: MatchFormData) => {
    await createMatch.mutateAsync({
      tournament_id: tournamentId,
      round_id: roundId,
      match_number: data.match_number,
      player_a: data.player_a,
      player_b: data.player_b,
    })
    reset({ match_number: nextNumber + 1 })
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full rounded border border-dashed border-gray-700 py-2 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-300"
      >
        + Match hinzufügen
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 rounded border border-gray-700 bg-gray-800 p-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <input type="number" {...register('match_number')} placeholder="#" className="w-full rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm" />
          {errors.match_number && <p className="text-xs text-red-400">{errors.match_number.message}</p>}
        </div>
        <div>
          <input {...register('player_a')} placeholder="Spieler A" className="w-full rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm" />
          {errors.player_a && <p className="text-xs text-red-400">{errors.player_a.message}</p>}
        </div>
        <div>
          <input {...register('player_b')} placeholder="Spieler B" className="w-full rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm" />
          {errors.player_b && <p className="text-xs text-red-400">{errors.player_b.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={createMatch.isPending} className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50">
          Erstellen
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-400">Abbrechen</button>
      </div>
    </form>
  )
}
