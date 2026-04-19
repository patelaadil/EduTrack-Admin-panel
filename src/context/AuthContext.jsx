import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile row from our profiles table
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  useEffect(() => {
    let mounted = true
    let fallbackTimer

    const syncAuth = async (session) => {
      if (!mounted) return
      setLoading(true)
      try {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (_) {
        setProfile(null)
        setUser(session?.user ?? null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Guard against a hanging auth/profile bootstrap.
    fallbackTimer = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 8000)

    // Get current session on mount and wait for the profile so role checks are accurate.
    supabase.auth.getSession().then(({ data: { session } }) => syncAuth(session))

    // Listen for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuth(session)
    })

    return () => {
      mounted = false
      clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
