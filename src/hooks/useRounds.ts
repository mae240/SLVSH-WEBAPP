import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Round = Database['public']['Tables']['rounds']['Row']

function hasExpiredRounds(rounds: Round[]) {
  return rounds.some(
    (r) => !r.is_locked && r.deadline_at && new Date(r.deadline_at) <= new Date()
  )
}

function useAutoLock(rounds: Round[] | undefined, queryKey: QueryKey) {
  const qc = useQueryClient()
  useEffect(() => {
    if (!rounds || !hasExpiredRounds(rounds)) return
    supabase.rpc('auto_lock_expired_rounds').then(({ error }) => {
      if (error) console.error('Auto-lock failed:', error)
      else qc.invalidateQueries({ queryKey })
    })
  }, [rounds, queryKey, qc])
}

export function useRounds(tournamentId: string | undefined) {
  const query = useQuery({
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

  const autoLockKey = useMemo(() => ['rounds', tournamentId], [tournamentId])
  useAutoLock(query.data, autoLockKey)

  return query
}

export function useRound(roundId: string | undefined) {
  const query = useQuery({
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

  const autoLockKey = useMemo(() => ['round', roundId], [roundId])
  useAutoLock(query.data ? [query.data] : undefined, autoLockKey)

  return query
}
