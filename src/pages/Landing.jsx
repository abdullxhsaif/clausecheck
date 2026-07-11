import { Link } from 'react-router-dom'
import {
  ShieldCheck, Zap, ScanLine, Scale, Lightbulb, Lock, ArrowRight, FileSearch,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const features = [
  { Icon: ScanLine, title: 'Clause-by-clause scan', body: 'Paste any contract or Terms of Service and get every risky clause surfaced in seconds.' },
  { Icon: Scale, title: 'Severity scoring', body: 'Each flag is rated low, medium, or high so you know what actually deserves attention.' },
  { Icon: Lightbulb, title: 'Negotiation tips', body: 'Every flag comes with a concrete, plain-English suggestion for what to ask for.' },
  { Icon: Lock, title: 'Private by design', body: 'Your text is analyzed on demand and never sold. No document is stored without your account.' },
]

const steps = [
  { n: '1', title: 'Paste the text', body: 'Drop in a Terms of Service, lease, NDA, or employment offer.' },
  { n: '2', title: 'AI reads the fine print', body: 'ClauseCheck identifies the clauses that could cost or bind you.' },
  { n: '3', title: 'Act with confidence', body: 'Get a risk score, plain-English breakdown, and what to negotiate.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-5 pt-20 pb-16 text-center relative">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs text-brand-300 mb-6">
            <Zap className="w-3.5 h-3.5" /> AI contract review, in seconds
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">
            Know exactly what <br className="hidden sm:block" />
            you're <span className="gradient-text">signing</span>.
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
            ClauseCheck reads contracts and Terms of Service for you — flagging risky clauses,
            scoring their severity, and telling you what to negotiate. No legalese required.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-[#0b1120] font-semibold hover:bg-brand-400 transition">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-gray-200 hover:bg-white/5 transition">
              See pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">5 free analyses · no card required</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ Icon, title, body }) => (
          <div key={title} className="card p-6">
            <span className="w-11 h-11 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-brand-400" />
            </span>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold flex items-center justify-center gap-2">
            <FileSearch className="w-7 h-7 text-brand-400" /> How it works
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-[#0b1120] font-bold flex items-center justify-center mb-4">{s.n}</div>
              <h3 className="font-semibold text-white text-lg">{s.title}</h3>
              <p className="mt-2 text-gray-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-10 w-full">
        <div className="card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-cyan-500/5 pointer-events-none" />
          <ShieldCheck className="w-10 h-10 text-brand-400 mx-auto mb-4 relative" />
          <h2 className="text-2xl sm:text-3xl font-extrabold relative">Stop signing things you haven't read</h2>
          <p className="mt-3 text-gray-300 relative">Your first five analyses are on us.</p>
          <Link to="/login" className="relative inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-brand-500 text-[#0b1120] font-semibold hover:bg-brand-400 transition">
            Analyze a document <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
