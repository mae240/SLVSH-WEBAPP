import { createContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Kein Tabellen-Row-Typ: authenticated hat seit Migration 016 nur noch
// Spalten-Grants auf id/display_name/created_at; is_admin kommt per RPC.
export interface Profile {
  id: string
  display_name: string
  created_at: string
  is_admin: boolean
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile> => {
      const [profileRes, adminRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, created_at')
          .eq('id', user!.id)
          .single(),
        supabase.rpc('is_admin'),
      ])
      if (profileRes.error) throw profileRes.error
      if (adminRes.error) throw adminRes.error
      return { ...profileRes.data, is_admin: adminRes.data === true }
    },
    enabled: !!user,
  })

  const signIn = useCallback(async (username: string, password: string) => {
    const email = `${username.toLowerCase()}@slvsh.local`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }, [queryClient])

  const loading = !authReady || (!!user && profileLoading)

  return (
    <AuthContext.Provider value={{ user, profile: profile ?? null, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
