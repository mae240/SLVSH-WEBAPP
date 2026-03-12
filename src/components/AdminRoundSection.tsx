import { useState } from 'react'
import type { Database } from '@/types/database'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions } from '@/hooks/usePredictions'
import { useUpdateRound } from '@/hooks/useAdmin'
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
  const [expanded, setExpanded] = useState(false)

  const [editingDeadline, setEditingDeadline] = useState(false)
  const [deadlineValue, setDeadlineValue] = useState('')
  const isPast = new Date(round.deadline_at) <= new Date()

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
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium">{round.name}</span>
          <span className="text-xs text-gray-500">
            {new Date(round.deadline_at).toLocaleString('de-DE')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!round.is_open && !round.is_locked && (
            <span className="rounded bg-gray-600/20 px-2 py-0.5 text-xs text-gray-400">Vorbereitung</span>
          )}
          {round.is_open && !round.is_locked && !isPast && (
            <span className="rounded bg-green-600/20 px-2 py-0.5 text-xs text-green-400">Offen</span>
          )}
          {round.is_open && !round.is_locked && isPast && (
            <span className="rounded bg-yellow-600/20 px-2 py-0.5 text-xs text-yellow-400">Deadline vorbei</span>
          )}
          {round.is_locked && (
            <span className="rounded bg-red-600/20 px-2 py-0.5 text-xs text-red-400">Gesperrt</span>
          )}
          <span className="text-gray-500">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleOpen}
              disabled={updateRound.isPending}
              className={`rounded px-3 py-1 text-xs font-medium ${
                round.is_open
                  ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                  : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
              }`}
            >
              {round.is_open ? 'Zurücknehmen' : 'Freigeben'}
            </button>
            <button
              onClick={toggleLock}
              disabled={updateRound.isPending}
              className={`rounded px-3 py-1 text-xs font-medium ${
                round.is_locked
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
              }`}
            >
              {round.is_locked ? 'Entsperren' : 'Sperren'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Deadline:</span>
            {editingDeadline ? (
              <form
                className="flex items-center gap-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!deadlineValue) return
                  await updateRound.mutateAsync({
                    id: round.id,
                    tournamentId,
                    deadline_at: new Date(deadlineValue).toISOString(),
                  })
                  setEditingDeadline(false)
                }}
              >
                <input
                  type="datetime-local"
                  value={deadlineValue}
                  onChange={(e) => setDeadlineValue(e.target.value)}
                  className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-200"
                />
                <button
                  type="submit"
                  disabled={updateRound.isPending}
                  className="rounded bg-blue-600/20 px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-600/30"
                >
                  Speichern
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDeadline(false)}
                  className="text-xs text-gray-500 hover:text-gray-400"
                >
                  Abbrechen
                </button>
              </form>
            ) : (
              <>
                <span className="text-gray-300">{new Date(round.deadline_at).toLocaleString('de-DE')}</span>
                <button
                  onClick={() => {
                    const d = new Date(round.deadline_at)
                    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    setDeadlineValue(local)
                    setEditingDeadline(true)
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Ändern
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
            <p className="text-sm text-gray-500">Keine Matches.</p>
          )}

          <AdminAddMatch tournamentId={tournamentId} roundId={round.id} nextNumber={(matches?.length ?? 0) + 1} />
        </div>
      )}
    </div>
  )
}
