import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

const passwordSchema = z.object({
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirm'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export function SettingsPage() {
  const { profile } = useAuth()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordFormData) => {
    setSuccess(false)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password: data.password })
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      reset()
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="text-sm text-gray-400">
          Angemeldet als <span className="font-medium text-gray-200">{profile?.display_name}</span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 space-y-4">
        <h2 className="text-lg font-semibold">Passwort ändern</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs text-gray-400">Neues Passwort</label>
            <input
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-400">Passwort bestätigen</label>
            <input
              type="password"
              {...register('confirm')}
              className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm"
            />
            {errors.confirm && <p className="mt-1 text-xs text-red-400">{errors.confirm.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Speichern...' : 'Passwort ändern'}
          </button>
          {success && <p className="text-sm text-green-400">Passwort erfolgreich geändert.</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </div>
    </div>
  )
}
