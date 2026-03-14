import { z } from 'zod'

export const winnerLettersOptions = ['S', 'SL', 'SLV', 'SLVS'] as const
export const allLettersOptions = ['none', 'S', 'SL', 'SLV', 'SLVS'] as const

export const predictionSchema = z.object({
  predicted_winner: z.string().min(1, 'Pick a winner'),
  predicted_winner_letters: z.enum(allLettersOptions, {
    errorMap: () => ({ message: 'Pick the letters' }),
  }),
})

export type PredictionFormData = z.infer<typeof predictionSchema>
