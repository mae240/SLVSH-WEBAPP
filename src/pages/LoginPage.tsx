import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginFormData } from '@/schemas/login'

export function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-brand" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const { error } = await signIn(data.username, data.password)
    if (error) {
      setServerError(error.message === 'Invalid login credentials'
        ? 'Invalid username or password'
        : error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <img src="/logo.png" alt="SLVSH Bets" className="mx-auto w-full max-w-xs drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]" />
          <p className="text-sm text-gray-600">Sign in to place your bets</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              {...register('username')}
              className="input mt-1"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="input mt-1"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-400">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
