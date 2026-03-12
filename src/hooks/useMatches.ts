import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMatches(roundId: string | undefined) {
  return useQuery({
    queryKey: ['matches', roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('round_id', roundId!)
        .order('match_number')
      if (error) throw error
      return data
    },
    enabled: !!roundId,
  })
}
