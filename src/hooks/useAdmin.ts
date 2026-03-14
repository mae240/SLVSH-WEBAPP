import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database, WinnerLetters, TournamentStatus } from '@/types/database'

type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
type RoundInsert = Database['public']['Tables']['rounds']['Insert']
type MatchInsert = Database['public']['Tables']['matches']['Insert']

// ── Tournaments ──

export function useCreateTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; slug: string; description?: string; createdBy: string }) => {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          created_by: input.createdBy,
        } satisfies TournamentInsert)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments'] }),
  })
}

export function useUpdateTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; name?: string; slug?: string; description?: string | null; status?: TournamentStatus }) => {
      const { data, error } = await supabase
        .from('tournaments')
        .update({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.status !== undefined && { status: input.status }),
        })
        .eq('id', input.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments'] })
      qc.invalidateQueries({ queryKey: ['tournament'] })
    },
  })
}

// ── Rounds ──

export function useCreateRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: RoundInsert) => {
      const { data, error } = await supabase
        .from('rounds')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['rounds', v.tournament_id] }),
  })
}

export function useUpdateRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; tournamentId: string; name?: string; deadline_at?: string | null; is_locked?: boolean; is_open?: boolean }) => {
      const { data, error } = await supabase
        .from('rounds')
        .update({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.deadline_at !== undefined && { deadline_at: input.deadline_at }),
          ...(input.is_locked !== undefined && { is_locked: input.is_locked }),
          ...(input.is_open !== undefined && { is_open: input.is_open }),
        })
        .eq('id', input.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['rounds', v.tournamentId] })
      qc.invalidateQueries({ queryKey: ['round', v.id] })
    },
  })
}

// ── Matches ──

export function useCreateMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: MatchInsert) => {
      const { data, error } = await supabase
        .from('matches')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['matches', v.round_id] }),
  })
}

export function useUpdateMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; roundId: string; winner?: string | null; winner_letters?: WinnerLetters | null; is_finished?: boolean }) => {
      const { data, error } = await supabase
        .from('matches')
        .update({
          ...(input.winner !== undefined && { winner: input.winner }),
          ...(input.winner_letters !== undefined && { winner_letters: input.winner_letters }),
          ...(input.is_finished !== undefined && { is_finished: input.is_finished }),
        })
        .eq('id', input.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['matches', v.roundId] }),
  })
}

// ── Delete ──

export function useDeleteTournament() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tournaments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments'] }),
  })
}

export function useDeleteRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tournamentId }: { id: string; tournamentId: string }) => {
      const { error } = await supabase.from('rounds').delete().eq('id', id)
      if (error) throw error
      return tournamentId
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['rounds', v.tournamentId] }),
  })
}

export function useDeleteMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, roundId }: { id: string; roundId: string }) => {
      const { error } = await supabase.from('matches').delete().eq('id', id)
      if (error) throw error
      return roundId
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['matches', v.roundId] }),
  })
}

// ── Admin Prediction Editing ──

export function useAdminUpdatePrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; roundId: string; predictedWinner: string; predictedWinnerLetters: WinnerLetters | null }) => {
      const { data, error } = await supabase
        .from('predictions')
        .update({
          predicted_winner: input.predictedWinner,
          predicted_winner_letters: input.predictedWinnerLetters,
        })
        .eq('id', input.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['predictions', v.roundId] }),
  })
}
