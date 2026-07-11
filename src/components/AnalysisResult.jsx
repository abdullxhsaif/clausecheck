import { FileText, Lightbulb, Quote } from 'lucide-react'
import RiskBadge from './RiskBadge.jsx'

export default function AnalysisResult({ data }) {
  if (!data) return null
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-gray-200 font-semibold">
            <FileText className="w-5 h-5 text-brand-400" />
            {data.documentType || 'Document'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            Overall risk: <RiskBadge level={data.overallRisk} />
          </div>
        </div>
        {data.summary && <p className="mt-3 text-gray-300 leading-relaxed">{data.summary}</p>}
      </div>

      <div className="space-y-3">
        {data.clauses.map((c, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-white">{c.title}</h4>
              <RiskBadge level={c.severity} />
            </div>
            {c.quote && (
              <p className="mt-3 flex gap-2 text-sm text-gray-400 italic">
                <Quote className="w-4 h-4 shrink-0 mt-0.5" /> {c.quote}
              </p>
            )}
            <p className="mt-3 text-gray-300 leading-relaxed">{c.explanation}</p>
            {c.suggestion && (
              <p className="mt-3 flex gap-2 text-sm text-brand-300">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" /> {c.suggestion}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
