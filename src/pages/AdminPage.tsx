import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAllTournaments } from '@/hooks/useTournaments'
import { useCreateTournament, useDeleteTournament } from '@/hooks/useAdmin'
import { useAuth } from '@/hooks/useAuth'
import { tournamentSchema, type TournamentFormData } from '@/schemas/admin'

export function AdminPage() {
  const { user } = useAuth()
  const { data: tournaments, isLoading, error } = useAllTournaments()
  const createTournament = useCreateTournament()
  const deleteTournament = useDeleteTournament()
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
  })

  const onSubmit = async (data: TournamentFormData) => {
    await createTournament.mutateAsync({
      name: data.name,
      slug: data.slug,
      description: data.description,
      createdBy: user!.id,
    })
    reset()
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-brand" />
      </div>
    )
  }

  if (error) return <p className="text-red-400">Failed to load.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'New Tournament'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
            <input {...register('name')} className="input mt-1" />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</label>
            <input {...register('slug')} className="input mt-1" placeholder="e-g-slvsh-cup-2026" />
            {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Description (optional)</label>
            <input {...register('description')} className="input mt-1" />
          </div>
          <button type="submit" disabled={createTournament.isPending} className="btn-primary">
            {createTournament.isPending ? 'Creating...' : 'Create'}
          </button>
          {createTournament.isError && <p className="text-sm text-red-400">Failed to create.</p>}
        </form>
      )}

      <div className="space-y-3">
        {tournaments?.map((t) => (
          <div key={t.id} className="card group transition hover:border-brand/30">
            <div className="flex items-center justify-between">
              <Link to={`/admin/tournament/${t.id}`} className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium group-hover:text-brand transition">{t.name}</span>
                  <span className={
                    t.status === 'active' ? 'badge-green'
                    : t.status === 'draft' ? 'badge-yellow'
                    : 'badge-gray'
                  }>
                    {t.status}
                  </span>
                </div>
              </Link>
              {confirmDeleteId === t.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Delete?</span>
                  <button
                    onClick={async () => { await deleteTournament.mutateAsync(t.id); setConfirmDeleteId(null) }}
                    disabled={deleteTournament.isPending}
                    className="badge-red cursor-pointer hover:bg-red-500/20 disabled:opacity-50"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs text-gray-600 hover:text-gray-400 transition"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(t.id)}
                  className="text-xs text-gray-700 hover:text-red-400 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {!tournaments?.length && <p className="text-gray-600">No tournaments yet.</p>}
      </div>
    </div>
  )
}
