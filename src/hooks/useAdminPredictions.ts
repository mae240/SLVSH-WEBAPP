import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { WinnerLetters } from '@/types/database'

export function useAdminCreatePrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      matchId: string
      tournamentId: string
      roundId: string
      userId: string
      predictedWinner: string
      predictedWinnerLetters: WinnerLetters | null
    }) => {
      const { data, error } = await supabase
        .from('predictions')
        .insert({
          match_id: input.matchId,
          tournament_id: input.tournamentId,
          round_id: input.roundId,
          user_id: input.userId,
          predicted_winner: input.predictedWinner,
          predicted_winner_letters: input.predictedWinnerLetters,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['predictions', v.roundId] }),
  })
}
