import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

const passwordSchema = z.object({
  password: z.string().min(6, 'At least 6 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
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
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="card">
        <div className="text-sm text-gray-500">
          Signed in as <span className="font-medium text-brand">{profile?.display_name}</span>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">New Password</label>
            <input type="password" {...register('password')} className="input mt-1" />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Confirm Password</label>
            <input type="password" {...register('confirm')} className="input mt-1" />
            {errors.confirm && <p className="mt-1 text-xs text-red-400">{errors.confirm.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : 'Update Password'}
          </button>
          {success && <p className="text-sm text-green-400">Password updated successfully.</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </div>
    </div>
  )
}
