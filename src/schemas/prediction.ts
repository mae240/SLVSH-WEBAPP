import { z } from 'zod'

export const winnerLettersOptions = ['S', 'SL', 'SLV', 'SLVS'] as const
export const allLettersOptions = ['none', 'S', 'SL', 'SLV', 'SLVS'] as const

export const predictionSchema = z.object({
  predicted_winner: z.string().min(1, 'Wähle einen Gewinner'),
  predicted_winner_letters: z.enum(allLettersOptions, {
    errorMap: () => ({ message: 'Wähle die Buchstaben' }),
  }),
})

export type PredictionFormData = z.infer<typeof predictionSchema>
