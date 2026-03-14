import { useParams, Link } from 'react-router-dom'
import { useTournament } from '@/hooks/useTournaments'
import { useRounds } from '@/hooks/useRounds'
import { useLeaderboard, useLeaderboardByRound } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

function rankDisplay(rank: number) {
  if (rank === 1) return <span className="text-brand font-bold">#1</span>
  if (rank === 2) return <span className="text-gray-300 font-bold">#2</span>
  if (rank === 3) return <span className="text-yellow-600 font-bold">#3</span>
  return <span className="text-gray-600">{rank}.</span>
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-brand" />
      </div>
    )
  }

  if (!tournament) return <p className="text-red-400">Tournament not found.</p>

  const board = selectedRoundId ? roundBoard : totalBoard
  const loading = selectedRoundId ? roundLoading : totalLoading

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/tournament/${slug}`} className="text-sm text-gray-600 hover:text-brand transition">&larr; {tournament.name}</Link>
        <h1 className="mt-2 text-2xl font-bold">Leaderboard</h1>
      </div>

      {rounds && rounds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRoundId(null)}
            className={`rounded-lg px-3 py-1 text-sm transition ${!selectedRoundId ? 'bg-brand text-black font-medium' : 'bg-gray-900 text-gray-500 hover:text-gray-300'}`}
          >
            Overall
          </button>
          {rounds.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoundId(r.id)}
              className={`rounded-lg px-3 py-1 text-sm transition ${selectedRoundId === r.id ? 'bg-brand text-black font-medium' : 'bg-gray-900 text-gray-500 hover:text-gray-300'}`}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-800 border-t-brand" />
        </div>
      ) : !board?.length ? (
        <p className="text-gray-600">No results yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-800/60">
          <table className="w-full text-sm">
            <thead className="bg-gray-950 text-gray-600 uppercase tracking-wider text-xs">
              <tr className="border-b border-gray-800/60">
                <th className="w-16 px-4 py-3 text-center font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Player</th>
                <th className="px-4 py-3 text-right font-medium">Points</th>
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
                        ? 'bg-brand/5 border-b border-brand/10'
                        : 'border-b border-gray-800/30 hover:bg-gray-950/50'
                    }
                  >
                    <td className="px-4 py-3 text-center">{rankDisplay(row.rank)}</td>
                    <td className={`px-4 py-3 ${isMe ? 'font-semibold text-brand' : 'text-gray-300'}`}>
                      {row.user_display_name}{isMe ? ' (you)' : ''}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        row.rank === 1 ? 'text-brand'
                        : row.rank === 2 ? 'text-gray-300'
                        : row.rank === 3 ? 'text-yellow-600'
                        : 'text-gray-500'
                      }`}>
                        {row.total_points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.matches_scored}</td>
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
