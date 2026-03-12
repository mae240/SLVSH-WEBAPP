import { useParams, Link } from 'react-router-dom'
import { useTournament } from '@/hooks/useTournaments'
import { useRounds } from '@/hooks/useRounds'
import { useLeaderboard, useLeaderboardByRound } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

function rankDisplay(rank: number) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return <span className="text-gray-500">{rank}.</span>
}

export function LeaderboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: tournament, isLoading: tLoading } = useTournament(slug!)
  const { data: rounds } = useRounds(tournament?.id)
  const { user } = useAuth()
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null)

  const { data: totalBoard, isLoading: totalLoading } = useLeaderboard(tournament?.id)
  const { data: roundBoard, isLoading: roundLoading } = useLeaderboardByRound(selectedRoundId ?? undefined)

  if (tLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
      </div>
    )
  }

  if (!tournament) return <p className="text-red-400">Turnier nicht gefunden.</p>

  const board = selectedRoundId ? roundBoard : totalBoard
  const loading = selectedRoundId ? roundLoading : totalLoading

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/tournament/${slug}`} className="text-sm text-gray-400 hover:text-gray-300">&larr; {tournament.name}</Link>
        <h1 className="mt-2 text-2xl font-bold">Leaderboard</h1>
      </div>

      {rounds && rounds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRoundId(null)}
            className={`rounded px-3 py-1 text-sm ${!selectedRoundId ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
          >
            Gesamt
          </button>
          {rounds.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoundId(r.id)}
              className={`rounded px-3 py-1 text-sm ${selectedRoundId === r.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
        </div>
      ) : !board?.length ? (
        <p className="text-gray-400">Noch keine Ergebnisse.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr className="border-b border-gray-800">
                <th className="w-16 px-4 py-3 text-center font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Spieler</th>
                <th className="px-4 py-3 text-right font-medium">Punkte</th>
                <th className="px-4 py-3 text-right font-medium">Matches</th>
              </tr>
            </thead>
            <tbody>
              {board.map((row) => {
                const isMe = row.user_id === user?.id
                return (
                  <tr
                    key={row.user_id}
                    className={
                      isMe
                        ? 'bg-orange-500/10 border-b border-orange-500/20'
                        : 'border-b border-gray-800/50 hover:bg-gray-900/50'
                    }
                  >
                    <td className="px-4 py-3 text-center">{rankDisplay(row.rank)}</td>
                    <td className={`px-4 py-3 ${isMe ? 'font-semibold text-orange-400' : 'text-gray-200'}`}>
                      {row.user_display_name}{isMe ? ' (du)' : ''}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        row.rank === 1 ? 'text-yellow-400'
                        : row.rank === 2 ? 'text-gray-300'
                        : row.rank === 3 ? 'text-orange-400'
                        : ''
                      }`}>
                        {row.total_points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{row.matches_scored}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
