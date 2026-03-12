import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useTournaments() {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['active', 'finished'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useAllTournaments() {
  return useQuery({
    queryKey: ['tournaments', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useTournament(slug: string) {
  return useQuery({
    queryKey: ['tournament', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    },
  })
}
