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
      deadline_at: new Date(data.deadline_at).toISOString(),
    })
    reset({ round_order: nextOrder + 1 })
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full rounded-lg border border-dashed border-gray-700 py-3 text-sm text-gray-400 hover:border-gray-600 hover:text-gray-300"
      >
        + Runde hinzufügen
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h3 className="text-sm font-semibold">Neue Runde</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs text-gray-400">Name</label>
          <input {...register('name')} className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-400">Reihenfolge</label>
          <input type="number" {...register('round_order')} className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm" />
          {errors.round_order && <p className="mt-1 text-xs text-red-400">{errors.round_order.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-400">Deadline</label>
          <input type="datetime-local" {...register('deadline_at')} className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm" />
          {errors.deadline_at && <p className="mt-1 text-xs text-red-400">{errors.deadline_at.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={createRound.isPending} className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
          Erstellen
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="rounded px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300">
          Abbrechen
        </button>
      </div>
    </form>
  )
}
