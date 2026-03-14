import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateRound } from '@/hooks/useAdmin'
import { roundSchema, type RoundFormData } from '@/schemas/admin'

interface Props {
  tournamentId: string
  nextOrder: number
}

export function AdminAddRound({ tournamentId, nextOrder }: Props) {
  const [showForm, setShowForm] = useState(false)
  const createRound = useCreateRound()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RoundFormData>({
    resolver: zodResolver(roundSchema),
    defaultValues: { round_order: nextOrder },
  })

  const onSubmit = async (data: RoundFormData) => {
    await createRound.mutateAsync({
      tournament_id: tournamentId,
      name: data.name,
      round_order: data.round_order,
      ...(data.deadline_at ? { deadline_at: new Date(data.deadline_at).toISOString() } : {}),
    })
    reset({ round_order: nextOrder + 1 })
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full rounded-lg border border-dashed border-gray-800 py-3 text-sm text-gray-600 hover:border-brand/30 hover:text-brand transition"
      >
        + Add Round
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-3">
      <h3 className="text-sm font-semibold">New Round</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
          <input {...register('name')} className="input mt-1" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Order</label>
          <input type="number" {...register('round_order')} className="input mt-1" />
          {errors.round_order && <p className="mt-1 text-xs text-red-400">{errors.round_order.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline (optional)</label>
          <input type="datetime-local" {...register('deadline_at')} className="input mt-1" />
          {errors.deadline_at && <p className="mt-1 text-xs text-red-400">{errors.deadline_at.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={createRound.isPending} className="btn-primary">
          {createRound.isPending ? 'Creating...' : 'Create'}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  )
}
