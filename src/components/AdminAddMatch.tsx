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
        className="w-full rounded-lg border border-dashed border-gray-800 py-2 text-xs text-gray-600 hover:border-brand/30 hover:text-brand transition"
      >
        + Add Match
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 rounded-lg border border-gray-800/60 bg-black p-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <div>
          <input type="number" {...register('match_number')} placeholder="#" className="input !py-1 !text-sm" />
          {errors.match_number && <p className="text-xs text-red-400">{errors.match_number.message}</p>}
        </div>
        <div>
          <input {...register('player_a')} placeholder="Player A" className="input !py-1 !text-sm" />
          {errors.player_a && <p className="text-xs text-red-400">{errors.player_a.message}</p>}
        </div>
        <div>
          <input {...register('player_b')} placeholder="Player B" className="input !py-1 !text-sm" />
          {errors.player_b && <p className="text-xs text-red-400">{errors.player_b.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={createMatch.isPending} className="btn-primary !py-1 !px-3 !text-xs">
          {createMatch.isPending ? 'Creating...' : 'Create'}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-600 hover:text-gray-400 transition">Cancel</button>
      </div>
    </form>
  )
}
