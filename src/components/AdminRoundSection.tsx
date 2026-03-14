import { useState } from 'react'
import type { Database } from '@/types/database'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions } from '@/hooks/usePredictions'
import { useUpdateRound, useDeleteRound } from '@/hooks/useAdmin'
import { AdminMatchRow } from '@/components/AdminMatchRow'
import { AdminAddMatch } from '@/components/AdminAddMatch'

type Round = Database['public']['Tables']['rounds']['Row']

interface Props {
  round: Round
  tournamentId: string
}

export function AdminRoundSection({ round, tournamentId }: Props) {
  const { data: matches } = useMatches(round.id)
  const { data: predictions } = usePredictions(round.id)
  const updateRound = useUpdateRound()
  const deleteRound = useDeleteRound()
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [editingDeadline, setEditingDeadline] = useState(false)
  const [deadlineValue, setDeadlineValue] = useState('')
  const isPast = round.deadline_at ? new Date(round.deadline_at) <= new Date() : false

  const toggleLock = async () => {
    await updateRound.mutateAsync({
      id: round.id,
      tournamentId,
      is_locked: !round.is_locked,
    })
  }

  const toggleOpen = async () => {
    await updateRound.mutateAsync({
      id: round.id,
      tournamentId,
      is_open: !round.is_open,
    })
  }

  return (
    <div className="card !p-0 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium">{round.name}</span>
          {round.deadline_at && (
            <span className="text-xs text-gray-600">
              {new Date(round.deadline_at).toLocaleString('en-US')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!round.is_open && !round.is_locked && (
            <span className="badge-gray text-[10px]">Draft</span>
          )}
          {round.is_open && !round.is_locked && !isPast && (
            <span className="badge-green text-[10px]">Open</span>
          )}
          {round.is_open && !round.is_locked && isPast && (
            <span className="badge-yellow text-[10px]">Deadline passed</span>
          )}
          {round.is_locked && (
            <span className="badge-red text-[10px]">Locked</span>
          )}
          <span className="text-gray-600">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800/60 p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleOpen}
              disabled={updateRound.isPending}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                round.is_open
                  ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                  : 'bg-brand/10 text-brand hover:bg-brand/20'
              }`}
            >
              {round.is_open ? 'Revoke' : 'Release'}
            </button>
            <button
              onClick={toggleLock}
              disabled={updateRound.isPending}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                round.is_locked
                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {round.is_locked ? 'Unlock' : 'Lock'}
            </button>
            <div className="ml-auto">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Delete round?</span>
                  <button
                    onClick={() => deleteRound.mutate({ id: round.id, tournamentId })}
                    disabled={deleteRound.isPending}
                    className="badge-red cursor-pointer hover:bg-red-500/20 disabled:opacity-50"
                  >
                    Yes
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-600 hover:text-gray-400 transition">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-gray-700 hover:text-red-400 transition"
                >
                  Delete round
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Deadline:</span>
            {editingDeadline ? (
              <form
                className="flex items-center gap-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  await updateRound.mutateAsync({
                    id: round.id,
                    tournamentId,
                    deadline_at: deadlineValue ? new Date(deadlineValue).toISOString() : null,
                  })
                  setEditingDeadline(false)
                }}
              >
                <input
                  type="datetime-local"
                  value={deadlineValue}
                  onChange={(e) => setDeadlineValue(e.target.value)}
                  className="input !py-1 !px-2 !text-sm !w-auto"
                />
                <button type="submit" disabled={updateRound.isPending} className="btn-primary !px-2 !py-1 !text-xs">
                  Save
                </button>
                <button type="button" onClick={() => setEditingDeadline(false)} className="text-xs text-gray-600 hover:text-gray-400 transition">
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="text-gray-400">
                  {round.deadline_at ? new Date(round.deadline_at).toLocaleString('en-US') : 'None'}
                </span>
                <button
                  onClick={() => {
                    if (round.deadline_at) {
                      const d = new Date(round.deadline_at)
                      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                      setDeadlineValue(local)
                    } else {
                      setDeadlineValue('')
                    }
                    setEditingDeadline(true)
                  }}
                  className="text-xs text-brand hover:text-brand-light transition"
                >
                  Edit
                </button>
              </>
            )}
          </div>

          {matches?.length ? (
            <div className="space-y-2">
              {matches.map((match) => {
                const matchPreds = predictions?.filter((p) => p.match_id === match.id) ?? []
                return (
                  <AdminMatchRow key={match.id} match={match} predictions={matchPreds} roundId={round.id} />
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No matches.</p>
          )}

          <AdminAddMatch tournamentId={tournamentId} roundId={round.id} nextNumber={(matches?.length ?? 0) + 1} />
        </div>
      )}
    </div>
  )
}
