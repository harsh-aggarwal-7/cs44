import { createContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'

export const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Fetch the user profile from the users table.
   */
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
      return null
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        setSession(currentSession)

        if (currentSession?.user) {
          const profile = await fetchUserProfile(currentSession.user.id)
          setUser(profile)
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)

      if (event === 'SIGNED_IN' && newSession?.user) {
        // Small delay to let the trigger create the user profile
        setTimeout(async () => {
          const profile = await fetchUserProfile(newSession.user.id)
          setUser(profile)
          setLoading(false)
        }, 500)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        const profile = await fetchUserProfile(newSession.user.id)
        setUser(profile)
      } else if (event === 'USER_UPDATED' && newSession?.user) {
        const profile = await fetchUserProfile(newSession.user.id)
        setUser(profile)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  /**
   * Sign up with email and password.
   * The database trigger (handle_new_user) will auto-create the user profile.
   */
  const signUp = async (email, password, name) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign in with email and password.
   */
  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign out the current user.
   */
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Send a password reset email.
   */
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  /**
   * Update the current user's profile in the users table.
   */
  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUser(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const isAdmin = user?.role === 'admin'

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
