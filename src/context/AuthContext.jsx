import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider, firebaseReady } from '../lib/firebase.js'
import { PLANS } from '../lib/plans.js'

const NOT_READY = () =>
  Promise.reject(new Error('Authentication is not configured yet. Please try again shortly.'))

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (u) => {
    const ref = doc(db, 'clausecheck_users', u.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const fresh = {
        email: u.email || '',
        plan: 'free',
        credits: PLANS.free.credits,
        createdAt: Date.now(),
      }
      await setDoc(ref, fresh)
      setProfile(fresh)
    } else {
      setProfile(snap.data())
    }
  }, [])

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          await loadProfile(u)
        } catch (e) {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [loadProfile])

  const decrementCredit = useCallback(async () => {
    if (!user || !profile) return
    const next = Math.max(0, (profile.credits || 0) - 1)
    const ref = doc(db, 'clausecheck_users', user.uid)
    await updateDoc(ref, { credits: next })
    setProfile((p) => ({ ...p, credits: next }))
  }, [user, profile])

  const value = {
    user,
    profile,
    loading,
    firebaseReady,
    loginEmail: (email, pw) => (firebaseReady ? signInWithEmailAndPassword(auth, email, pw) : NOT_READY()),
    signupEmail: (email, pw) => (firebaseReady ? createUserWithEmailAndPassword(auth, email, pw) : NOT_READY()),
    loginGoogle: () => (firebaseReady ? signInWithPopup(auth, googleProvider) : NOT_READY()),
    logout: () => (firebaseReady ? signOut(auth) : Promise.resolve()),
    decrementCredit,
    refreshProfile: () => user && loadProfile(user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
