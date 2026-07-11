import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2 font-semibold text-gray-200">
          <ShieldCheck className="w-4 h-4 text-brand-400" /> ClauseCheck
        </div>
        <p className="text-center">Informational analysis only — not legal advice.</p>
        <div className="flex gap-5">
          <Link to="/pricing" className="hover:text-white">Pricing</Link>
          <Link to="/login" className="hover:text-white">Sign in</Link>
        </div>
      </div>
    </footer>
  )
}
