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
  const fetchUserProfile = useCallback(async (userId, authUserFallback = null) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found in public.users table. Attempt self-healing profile insertion.
          const authUser = authUserFallback
          if (!authUser) {
            console.error('AnswerHub Auth: No fallback auth user provided for self-healing profile.')
            return null
          }

          console.warn('AnswerHub Auth: Profile not found for user ID:', userId, '. Attempting self-healing insert...')
          const newProfile = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            email: authUser.email,
            role: 'user',
            avatar: authUser.user_metadata?.avatar_url || null
          }

          const { data: insertedData, error: insertError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single()

          if (insertError) {
            console.error('AnswerHub Auth: Failed to self-heal insert user profile:', insertError.message)
            return null
          }

          console.log('AnswerHub Auth: Self-healing profile insert successful!')
          return insertedData
        }
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
    let mounted = true
    let currentUserId = null // Prevent async race conditions
    console.log('AnswerHub Auth: Initializing auth subscriber...')

    // Watchdog timer: if loading is stuck at true for more than 3 seconds, auto-heal and reload (up to 2 times).
    const watchdog = setTimeout(() => {
      if (mounted) {
        console.warn('AnswerHub Auth: Loading stuck for 3s. Force clearing auth keys and reloading page to recover...')
        if (typeof window !== 'undefined') {
          try {
            // Check session storage reload counter to prevent infinite loops during offline/server-downtime states
            const reloadCountStr = sessionStorage.getItem('answerhub-auth-watchdog-reloads') || '0'
            const reloadCount = parseInt(reloadCountStr, 10)

            if (reloadCount < 2) {
              sessionStorage.setItem('answerhub-auth-watchdog-reloads', (reloadCount + 1).toString())

              const keysToRemove = []
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && (key.includes('sb-') || key.includes('supabase.auth'))) {
                  keysToRemove.push(key)
                }
              }
              keysToRemove.forEach(key => localStorage.removeItem(key))
              window.location.reload()
            } else {
              console.error('AnswerHub Auth: Watchdog reload limit reached. Halting auto-reload to prevent infinite loop.')
              // Graceful fallback: stop loading so page renders offline state or fallback content
              setLoading(false)
            }
          } catch (e) {
            console.error('Failed to auto-heal and reload:', e)
            setLoading(false)
          }
        }
      }
    }, 3000)

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error
        } = await supabase.auth.getSession()

        if (error) throw error

        if (mounted) {
          setSession(currentSession)
          if (currentSession?.user) {
            console.log('AnswerHub Auth: Found active session for user:', currentSession.user.email)
            currentUserId = currentSession.user.id
            const profile = await fetchUserProfile(currentSession.user.id, currentSession.user)
            if (mounted && currentUserId === currentSession.user.id) {
              if (!profile) {
                // Stale/corrupted session from another project. Force sign out to clean localStorage.
                console.warn('AnswerHub Auth: Initial session is invalid (profile not found/creatable). Force signing out to clean local storage.')
                await supabase.auth.signOut()
                setUser(null)
                setSession(null)
              } else {
                setUser(profile)
              }
            }
          } else {
            console.log('AnswerHub Auth: No active session found.')
            currentUserId = null
            setUser(null)
          }
        }
      } catch (err) {
        console.error('AnswerHub Auth: Error getting initial session, clearing local session keys...', err)
        // Self-healing: clear localStorage auth keys to recover from stale switches
        if (typeof window !== 'undefined') {
          try {
            const keysToRemove = []
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && (key.includes('sb-') || key.includes('supabase.auth'))) {
                keysToRemove.push(key)
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key))
          } catch (e) {
            console.error('Failed to clear local storage:', e)
          }
        }
        if (mounted) {
          currentUserId = null
          setUser(null)
          setSession(null)
        }
      } finally {
        if (mounted) {
          clearTimeout(watchdog)
          try {
            sessionStorage.removeItem('answerhub-auth-watchdog-reloads')
          } catch (e) {}
          setLoading(false)
          console.log('AnswerHub Auth: Initial session load complete. Loading set to false.')
        }
      }
    }

    getInitialSession()

    // Subscribe to auth state changes safely wrapped in try-catch
    let subscription = null
    try {
      const {
        data: { subscription: activeSubscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return
        console.log(`AnswerHub Auth Event: ${event}`)
        setSession(newSession)

        try {
          if (event === 'SIGNED_IN' && newSession?.user) {
            currentUserId = newSession.user.id
            setLoading(true)
            const profile = await fetchUserProfile(newSession.user.id, newSession.user)
            if (mounted && currentUserId === newSession.user.id) {
              if (!profile) {
                console.warn('AnswerHub Auth: SIGNED_IN session is invalid (profile not found/creatable). Force signing out to clean local storage.')
                await supabase.auth.signOut()
                setUser(null)
                setSession(null)
              } else {
                setUser(profile)
                console.log('AnswerHub Auth: User signed in successfully. Profile loaded.')
              }
            }
          } else if (event === 'SIGNED_OUT') {
            currentUserId = null
            if (mounted) {
              setUser(null)
              setSession(null)
              console.log('AnswerHub Auth: User signed out.')
            }
          } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
            currentUserId = newSession.user.id
            const profile = await fetchUserProfile(newSession.user.id, newSession.user)
            if (mounted && currentUserId === newSession.user.id) {
              if (!profile) {
                console.warn('AnswerHub Auth: TOKEN_REFRESHED session is invalid. Force signing out.')
                await supabase.auth.signOut()
                setUser(null)
                setSession(null)
              } else {
                setUser(profile)
                console.log('AnswerHub Auth: Token refreshed.')
              }
            }
          } else if (event === 'USER_UPDATED' && newSession?.user) {
            currentUserId = newSession.user.id
            const profile = await fetchUserProfile(newSession.user.id, newSession.user)
            if (mounted && currentUserId === newSession.user.id) {
              if (!profile) {
                console.warn('AnswerHub Auth: USER_UPDATED session is invalid. Force signing out.')
                await supabase.auth.signOut()
                setUser(null)
                setSession(null)
              } else {
                setUser(profile)
                console.log('AnswerHub Auth: User profile updated.')
              }
            }
          }
        } catch (err) {
          console.error('AnswerHub Auth: Error handling auth state change:', err)
        } finally {
          if (mounted) {
            clearTimeout(watchdog)
            setLoading(false)
          }
        }
      })
      subscription = activeSubscription
    } catch (err) {
      console.error('AnswerHub Auth: Error setting up auth state change listener:', err)
    }

    return () => {
      mounted = false
      clearTimeout(watchdog)
      if (subscription) {
        subscription.unsubscribe()
      }
      console.log('AnswerHub Auth: Unsubscribed from auth events.')
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
