import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

export type LoginFormData = z.infer<typeof loginSchema>
