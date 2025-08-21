'use client'

import { SearchResponse } from '@/types'

interface CombinedResultsProps {
  data: SearchResponse
}

export default function CombinedResults({ data }: CombinedResultsProps) {
  if (data.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{data.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Answer Section */}
      {data.answer && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Answer</h2>
          <div className="prose max-w-none">
            <p className="text-slate-700 leading-relaxed">{data.answer}</p>
          </div>
          
          {data.citations && data.citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Sources:</h3>
              <ul className="space-y-1">
                {data.citations.map((citation, index) => (
                  <li key={index} className="text-sm">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {citation.title || citation.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Search Results Section */}
      {data.results && data.results.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="space-y-4">
            {data.results.map((result, index) => (
              <article key={index} className="border-b border-slate-200 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {result.title}
                      </a>
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      {result.domain}
                      {result.author && ` • ${result.author}`}
                      {result.published_date && ` • ${result.published_date}`}
                      {result.score && ` • Score: ${result.score.toFixed(2)}`}
                    </p>
                    
                    {result.highlights && result.highlights.length > 0 && (
                      <div className="space-y-1">
                        {result.highlights.map((highlight, hIndex) => (
                          <p key={hIndex} className="text-sm text-slate-700 bg-yellow-50 p-2 rounded">
                            {highlight}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!data.answer && !data.results?.length && (
        <div className="text-center py-8 text-slate-600">
          <p>No results found. Try a different search query.</p>
        </div>
      )}
    </div>
  )
}
