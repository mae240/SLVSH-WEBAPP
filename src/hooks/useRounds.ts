import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useRounds(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['rounds', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('tournament_id', tournamentId!)
        .order('round_order')
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
  })
}

export function useRound(roundId: string | undefined) {
  return useQuery({
    queryKey: ['round', roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', roundId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!roundId,
  })
}
