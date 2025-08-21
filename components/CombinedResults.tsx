'use client'

import { SearchResponse } from '@/types'

interface CombinedResultsProps {
  data: SearchResponse
}

export default function CombinedResults({ data }: CombinedResultsProps) {
  if (data.error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Search Error</h3>
          <p className="text-red-700">{data.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Answer Section */}
      {data.answer && (
        <section className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Answer</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base">{data.answer}</p>
                </div>
              </div>
            </div>
            
            {data.citations && data.citations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Sources</h3>
                <div className="grid gap-2">
                  {data.citations.map((citation, index) => (
                    <a
                      key={index}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {citation.title || citation.url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Search Results Section */}
      {data.results && data.results.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Web Results</h2>
          <div className="space-y-4">
            {data.results.map((result, index) => (
              <article key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">{result.domain}</span>
                      {result.score && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Score: {result.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium mb-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-lg leading-tight"
                      >
                        {result.title}
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {result.author && `${result.author} • `}
                      {result.published_date && `${result.published_date} • `}
                      {result.url}
                    </p>
                    
                    {result.highlights && result.highlights.length > 0 && (
                      <div className="space-y-2">
                        {result.highlights.map((highlight, hIndex) => (
                          <p key={hIndex} className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
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
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try a different search query or check your spelling.</p>
        </div>
      )}
    </div>
  )
}
