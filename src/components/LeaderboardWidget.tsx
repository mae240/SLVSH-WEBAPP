import { Link } from 'react-router-dom'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { RankDisplay } from './RankDisplay'

interface Props {
  tournamentId: string
  slug: string
}

export function LeaderboardWidget({ tournamentId, slug }: Props) {
  const { data: board, isLoading } = useLeaderboard(tournamentId)
  const { user } = useAuth()

  if (isLoading) return null
  if (!board?.length) return null

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="font-semibold">Leaderboard</h3>
        <Link to={`/tournament/${slug}/leaderboard`} className="text-xs text-brand hover:text-brand-light transition">
          Details &rarr;
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800/60 text-left text-xs text-gray-600 uppercase tracking-wider">
            <th className="w-12 px-4 py-2 font-medium"></th>
            <th className="px-2 py-2 font-medium">Player</th>
            <th className="px-4 py-2 text-right font-medium">Pts</th>
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
                    : 'border-b border-gray-800/30'
                }
              >
                <td className="px-4 py-1.5 text-center"><RankDisplay rank={row.rank ?? 0} /></td>
                <td className={`px-2 py-1.5 ${isMe ? 'font-medium text-brand' : 'text-gray-400'}`}>
                  {row.user_display_name}{isMe ? ' (you)' : ''}
                </td>
                <td className="px-4 py-1.5 text-right font-semibold">{row.total_points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
