import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { STRIPE_LINKS } from '../lib/plans.js'

const TIERS = [
  {
    id: 'free', name: 'Free', monthly: 0, yearly: 0,
    tagline: 'Try it out', cta: 'Start free',
    features: ['5 document analyses', 'Clause-by-clause flags', 'Severity scoring', 'Negotiation tips'],
  },
  {
    id: 'pro', name: 'Pro', monthly: 15, yearly: 144,
    tagline: 'For frequent signers', cta: 'Get Pro', highlight: true,
    features: ['150 analyses / month', 'Everything in Free', 'Priority AI quality', 'Analysis history', 'Email support'],
  },
  {
    id: 'team', name: 'Team', monthly: 49, yearly: 468,
    tagline: 'For small businesses', cta: 'Get Team',
    features: ['600 analyses / month', 'Everything in Pro', 'Shared workspace', 'Bulk paste', 'Priority support'],
  },
]

export default function Pricing() {
  const [yearly, setYearly] = useState(false)
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const linkFor = (id) => {
    if (id === 'pro') return yearly ? STRIPE_LINKS.proYearly : STRIPE_LINKS.proMonthly
    if (id === 'team') return yearly ? STRIPE_LINKS.teamYearly : STRIPE_LINKS.teamMonthly
    return ''
  }

  const onSelect = (tier) => {
    if (tier.id === 'free') { navigate(user ? '/dashboard' : '/login'); return }
    if (!user) { navigate('/login'); return }
    const url = linkFor(tier.id)
    if (!url) { navigate('/dashboard'); return }
    const email = profile?.email || user.email || ''
    window.location.href = `${url}?prefilled_email=${encodeURIComponent(email)}`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-6 text-center w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold">Simple, honest pricing</h1>
        <p className="mt-4 text-gray-300">Start free. Upgrade when the fine print piles up.</p>

        <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-xl border border-white/10 bg-white/5">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!yearly ? 'bg-brand-500 text-[#0b1120]' : 'text-gray-300'}`}
          >Monthly</button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-1 ${yearly ? 'bg-brand-500 text-[#0b1120]' : 'text-gray-300'}`}
          >Yearly <span className="text-xs opacity-80">save 20%</span></button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-10 grid md:grid-cols-3 gap-5 w-full">
        {TIERS.map((tier) => {
          const price = yearly ? tier.yearly : tier.monthly
          const suffix = tier.id === 'free' ? '' : yearly ? '/yr' : '/mo'
          return (
            <div key={tier.id} className={`card p-7 relative flex flex-col ${tier.highlight ? 'ring-2 ring-brand-500' : ''}`}>
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-500 text-[#0b1120] text-xs font-bold inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most popular
                </span>
              )}
              <h3 className="text-xl font-bold text-white">{tier.name}</h3>
              <p className="text-sm text-gray-400">{tier.tagline}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-white">${price}</span>
                <span className="text-gray-400 mb-1">{suffix}</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSelect(tier)}
                className={`mt-7 w-full py-3 rounded-xl font-semibold transition ${tier.highlight ? 'bg-brand-500 text-[#0b1120] hover:bg-brand-400' : 'border border-white/15 text-gray-100 hover:bg-white/5'}`}
              >{tier.cta}</button>
            </div>
          )
        })}
      </section>
      <Footer />
    </div>
  )
}
