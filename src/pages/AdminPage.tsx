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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
      </div>
    )
  }

  if (error) return <p className="text-red-400">Fehler beim Laden.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          {showForm ? 'Abbrechen' : 'Neues Turnier'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div>
            <label className="block text-sm text-gray-400">Name</label>
            <input {...register('name')} className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm" />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400">Slug</label>
            <input {...register('slug')} className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm" placeholder="z-b-slvsh-cup-2026" />
            {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400">Beschreibung (optional)</label>
            <input {...register('description')} className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={createTournament.isPending} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
            {createTournament.isPending ? 'Erstellen…' : 'Erstellen'}
          </button>
          {createTournament.isError && <p className="text-sm text-red-400">Fehler beim Erstellen.</p>}
        </form>
      )}

      <div className="space-y-3">
        {tournaments?.map((t) => (
          <div key={t.id} className="rounded-lg border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700">
            <div className="flex items-center justify-between">
              <Link to={`/admin/tournament/${t.id}`} className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{t.name}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    t.status === 'active' ? 'bg-green-600/20 text-green-400'
                    : t.status === 'draft' ? 'bg-yellow-600/20 text-yellow-400'
                    : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </Link>
              {confirmDeleteId === t.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Wirklich löschen?</span>
                  <button
                    onClick={async () => { await deleteTournament.mutateAsync(t.id); setConfirmDeleteId(null) }}
                    disabled={deleteTournament.isPending}
                    className="rounded bg-red-600/20 px-2 py-0.5 text-xs text-red-400 hover:bg-red-600/30 disabled:opacity-50"
                  >
                    Ja, löschen
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(t.id)}
                  className="rounded px-2 py-0.5 text-xs text-gray-600 hover:bg-red-600/20 hover:text-red-400"
                >
                  Löschen
                </button>
              )}
            </div>
          </div>
        ))}
        {!tournaments?.length && <p className="text-gray-400">Noch keine Turniere.</p>}
      </div>
    </div>
  )
}
