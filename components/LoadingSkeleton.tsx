export default function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Answer Section Skeleton */}
      <section>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-48"></div>
              <div className="h-3 bg-gray-200 rounded w-56"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Skeleton */}
      <section>
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
