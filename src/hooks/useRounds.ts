import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Round = Database['public']['Tables']['rounds']['Row']

async function autoLockExpiredRounds(rounds: Round[]) {
  const expired = rounds.filter(
    (r) => !r.is_locked && r.deadline_at && new Date(r.deadline_at) <= new Date()
  )
  if (!expired.length) return false
  const { error } = await supabase
    .from('rounds')
    .update({ is_locked: true })
    .in('id', expired.map((r) => r.id))
  if (error) console.error('Auto-lock failed:', error)
  return !error
}

export function useRounds(tournamentId: string | undefined) {
  const qc = useQueryClient()
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

  useEffect(() => {
    if (!query.data) return
    autoLockExpiredRounds(query.data).then((locked) => {
      if (locked) qc.invalidateQueries({ queryKey: ['rounds', tournamentId] })
    })
  }, [query.data, tournamentId, qc])

  return query
}

export function useRound(roundId: string | undefined) {
  const qc = useQueryClient()
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

  useEffect(() => {
    if (!query.data) return
    autoLockExpiredRounds([query.data]).then((locked) => {
      if (locked) qc.invalidateQueries({ queryKey: ['round', roundId] })
    })
  }, [query.data, roundId, qc])

  return query
}
