export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Answer Section Skeleton */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-slate-200 rounded w-24 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-48"></div>
            <div className="h-3 bg-slate-200 rounded w-56"></div>
          </div>
        </div>
      </section>

      {/* Search Results Skeleton */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-slate-200 pb-4 last:border-b-0">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
