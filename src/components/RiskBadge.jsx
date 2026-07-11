import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

const MAP = {
  high: { label: 'High', cls: 'bg-red-500/15 text-red-300 border-red-500/30', Icon: AlertTriangle },
  medium: { label: 'Medium', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30', Icon: AlertCircle },
  low: { label: 'Low', cls: 'bg-brand-500/15 text-brand-300 border-brand-500/30', Icon: CheckCircle2 },
}

export default function RiskBadge({ level }) {
  const { label, cls, Icon } = MAP[level] || MAP.low
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  )
}
