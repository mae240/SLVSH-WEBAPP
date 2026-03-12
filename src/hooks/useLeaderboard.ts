import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useLeaderboard(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['leaderboard', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_totals')
        .select('*')
        .eq('tournament_id', tournamentId!)
        .order('rank')
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
  })
}

export function useLeaderboardByRound(roundId: string | undefined) {
  return useQuery({
    queryKey: ['leaderboard-round', roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_by_round')
        .select('*')
        .eq('round_id', roundId!)
        .order('rank')
      if (error) throw error
      return data
    },
    enabled: !!roundId,
  })
}
