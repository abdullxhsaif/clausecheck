export default function ResultSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="card p-5 space-y-3">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="skeleton h-5 w-52 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
        </div>
      ))}
    </div>
  )
}
