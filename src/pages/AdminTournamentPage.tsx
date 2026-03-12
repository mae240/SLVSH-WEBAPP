import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useRounds } from '@/hooks/useRounds'
import { useUpdateTournament } from '@/hooks/useAdmin'
import { AdminRoundSection } from '@/components/AdminRoundSection'
import { AdminAddRound } from '@/components/AdminAddRound'
import type { TournamentStatus } from '@/types/database'

export function AdminTournamentPage() {
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
  const updateTournament = useUpdateTournament()
  const [editStatus, setEditStatus] = useState(false)

  if (tLoading || rLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
      </div>
    )
  }

  if (!tournament) return <p className="text-red-400">Turnier nicht gefunden.</p>

  const handleStatusChange = async (status: TournamentStatus) => {
    await updateTournament.mutateAsync({ id: tournament.id, status })
    setEditStatus(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin" className="text-sm text-gray-400 hover:text-gray-300">&larr; Admin</Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          {!editStatus ? (
            <button
              onClick={() => setEditStatus(true)}
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                tournament.status === 'active' ? 'bg-green-600/20 text-green-400'
                : tournament.status === 'draft' ? 'bg-yellow-600/20 text-yellow-400'
                : 'bg-gray-600/20 text-gray-400'
              }`}
            >
              {tournament.status}
            </button>
          ) : (
            <div className="flex gap-1">
              {(['draft', 'active', 'finished'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updateTournament.isPending}
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    s === tournament.status ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <Link
          to={`/admin/tournament/${tournament.id}/predictions`}
          className="inline-block rounded bg-blue-600/20 px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-600/30"
        >
          Alle Tipps verwalten
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Runden</h2>
        {rounds?.map((round) => (
          <AdminRoundSection key={round.id} round={round} tournamentId={tournament.id} />
        ))}
        {!rounds?.length && <p className="text-gray-500">Noch keine Runden.</p>}
      </div>

      <AdminAddRound tournamentId={tournament.id} nextOrder={(rounds?.length ?? 0) + 1} />
    </div>
  )
}
