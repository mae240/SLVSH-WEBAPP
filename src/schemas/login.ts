import { z } from 'zod'

export const loginSchema = z.object({
  // trim: fuehrende/anhaengende Leerzeichen wuerden eine falsche
  // Login-E-Mail (<username>@slvsh.local) erzeugen
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>
