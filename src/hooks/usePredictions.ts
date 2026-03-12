import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database, WinnerLetters } from '@/types/database'

type PredictionRow = Database['public']['Tables']['predictions']['Row']
export type PredictionWithProfile = PredictionRow & { profiles: { display_name: string } }

export function usePredictions(roundId: string | undefined) {
  return useQuery({
    queryKey: ['predictions', roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*, profiles!predictions_user_id_fkey(display_name)')
        .eq('round_id', roundId!)
      if (error) throw error
      return data as unknown as PredictionWithProfile[]
    },
    enabled: !!roundId,
  })
}

interface UpsertPredictionInput {
  matchId: string
  tournamentId: string
  roundId: string
  userId: string
  predictedWinner: string
  predictedWinnerLetters: WinnerLetters | null
  existingPredictionId?: string
}

export function useUpsertPrediction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpsertPredictionInput) => {
      if (input.existingPredictionId) {
        const { data, error } = await supabase
          .from('predictions')
          .update({
            predicted_winner: input.predictedWinner,
            predicted_winner_letters: input.predictedWinnerLetters,
          })
          .eq('id', input.existingPredictionId)
          .select()
          .single()
        if (error) throw error
        return data
      }

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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predictions', variables.roundId] })
    },
  })
}

export function useScoredPredictions(roundId: string | undefined) {
  return useQuery({
    queryKey: ['scored-predictions', roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scored_predictions')
        .select('*')
        .eq('round_id', roundId!)
      if (error) throw error
      return data
    },
    enabled: !!roundId,
  })
}

/** Group predictions by match_id for easy lookup */
export function groupPredictionsByMatch(predictions: PredictionWithProfile[]) {
  const map = new Map<string, PredictionWithProfile[]>()
  for (const p of predictions) {
    const list = map.get(p.match_id) ?? []
    list.push(p)
    map.set(p.match_id, list)
  }
  return map
}
