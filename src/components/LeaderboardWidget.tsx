import { Link } from 'react-router-dom'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  tournamentId: string
  slug: string
}

function rankDisplay(rank: number) {
  if (rank === 1) return <span className="text-lg">🥇</span>
  if (rank === 2) return <span className="text-lg">🥈</span>
  if (rank === 3) return <span className="text-lg">🥉</span>
  return <span className="text-sm text-gray-500">{rank}.</span>
}

export function LeaderboardWidget({ tournamentId, slug }: Props) {
  const { data: board, isLoading } = useLeaderboard(tournamentId)
  const { user } = useAuth()

  if (isLoading) return null
  if (!board?.length) return null

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="font-semibold">Leaderboard</h3>
        <Link to={`/tournament/${slug}/leaderboard`} className="text-xs text-blue-400 hover:text-blue-300">
          Details &rarr;
        </Link>
      </div>
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="w-12 px-4 py-2 font-medium"></th>
              <th className="px-2 py-2 font-medium">Spieler</th>
              <th className="px-4 py-2 text-right font-medium">Punkte</th>
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
                      : 'border-b border-gray-800/50'
                  }
                >
                  <td className="px-4 py-1.5 text-center">{rankDisplay(row.rank)}</td>
                  <td className={`px-2 py-1.5 ${isMe ? 'font-medium text-orange-400' : 'text-gray-300'}`}>
                    {row.user_display_name}{isMe ? ' (du)' : ''}
                  </td>
                  <td className="px-4 py-1.5 text-right font-semibold">{row.total_points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
