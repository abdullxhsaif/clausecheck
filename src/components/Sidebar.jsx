import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ScanLine, Tag, LogOut, Zap, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { PLANS } from '../lib/plans.js'

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  const planKey = profile?.plan || 'free'
  const max = PLANS[planKey]?.credits || 5
  const credits = profile?.credits ?? 0
  const pct = Math.max(0, Math.min(100, (credits / max) * 100))

  const doLogout = async () => {
    await logout()
    navigate('/')
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 font-extrabold">
          <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#0b1120]" />
          </span>
          Clause<span className="gradient-text">Check</span>
        </Link>
        <button className="md:hidden p-1" onClick={onClose} aria-label="Close menu"><X className="w-5 h-5" /></button>
      </div>

      <nav className="p-4 space-y-1">
        <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-500/15 text-brand-300 font-semibold">
          <ScanLine className="w-5 h-5" /> Analyzer
        </span>
        <Link to="/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 transition">
          <Tag className="w-5 h-5" /> Plans
        </Link>
      </nav>

      <div className="mx-4 mt-2 card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300 font-medium">AI credits</span>
          <span className="text-brand-300 font-semibold">{credits}/{max}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-gray-500 capitalize">{planKey} plan</p>
        {planKey === 'free' && (
          <Link to="/pricing" className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-500 text-[#0b1120] text-sm font-semibold hover:bg-brand-400 transition">
            <Zap className="w-4 h-4" /> Upgrade
          </Link>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 font-bold uppercase">
            {(profile?.email || user?.email || '?')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-200 truncate">{profile?.email || user?.email}</p>
          </div>
          <button onClick={doLogout} className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white" aria-label="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex w-72 shrink-0 border-r border-white/10 bg-[#0b1120] h-screen sticky top-0 overflow-y-auto">
        {content}
      </aside>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0b1120] border-r border-white/10">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
