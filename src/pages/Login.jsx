import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, Lock, Loader2, Github, Facebook } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

function friendlyError(code) {
  const map = {
    'auth/invalid-email': 'That email looks invalid.',
    'auth/user-not-found': 'No account with that email — try signing up.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'That email is already registered — sign in instead.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/operation-not-allowed': 'That sign-in method isn’t enabled yet.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const { loginEmail, signupEmail, loginGoogle } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      if (mode === 'login') await loginEmail(email, pw)
      else await signupEmail(email, pw)
      navigate('/dashboard')
    } catch (e2) {
      setErr(friendlyError(e2.code))
    } finally {
      setBusy(false)
    }
  }

  const google = async () => {
    setErr(''); setBusy(true)
    try {
      await loginGoogle()
      navigate('/dashboard')
    } catch (e2) {
      setErr(friendlyError(e2.code))
    } finally {
      setBusy(false)
    }
  }

  const notEnabled = () => setErr('That provider isn’t enabled yet — use Google or email for now.')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <Link to="/" className="flex items-center gap-2 font-extrabold text-xl mb-8">
        <span className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[#0b1120]" />
        </span>
        Clause<span className="gradient-text">Check</span>
      </Link>

      <div className="card p-7 w-full max-w-sm">
        <h1 className="text-xl font-bold text-white text-center">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-gray-400 text-center mt-1">
          {mode === 'login' ? 'Sign in to analyze documents' : 'Start with 5 free analyses'}
        </p>

        <button onClick={google} disabled={busy} className="mt-6 w-full py-2.5 rounded-lg bg-white text-gray-800 font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition disabled:opacity-60">
          <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5 text-xs text-gray-500">
          <div className="flex-1 h-px bg-white/10" /> or <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-400 outline-none" />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-brand-400 outline-none" />
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button type="submit" disabled={busy} className="w-full py-2.5 rounded-lg bg-brand-500 text-[#0b1120] font-semibold hover:bg-brand-400 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="flex gap-2 mt-4">
          <button onClick={notEnabled} className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400 text-sm flex items-center justify-center gap-2 hover:bg-white/5"><Github className="w-4 h-4" /> GitHub</button>
          <button onClick={notEnabled} className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400 text-sm flex items-center justify-center gap-2 hover:bg-white/5"><Facebook className="w-4 h-4" /> Facebook</button>
        </div>

        <p className="text-sm text-gray-400 text-center mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr('') }} className="text-brand-400 font-semibold">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
