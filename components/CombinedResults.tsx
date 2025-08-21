'use client'

import { useState } from 'react'
import { SearchResponse } from '@/types'

interface CombinedResultsProps {
  data: SearchResponse
  onQueryClick?: (query: string) => void
}

export default function CombinedResults({ data, onQueryClick }: CombinedResultsProps) {
  const [activeTab, setActiveTab] = useState<'answer' | 'sources' | 'web'>('answer')
  const [searchPage, setSearchPage] = useState(1)
  const [relatedPage, setRelatedPage] = useState(1)

  const ITEMS_PER_PAGE = 5

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

  // Determine which tabs to show
  const hasAnswer = !!data.answer
  const hasSources = data.citations && data.citations.length > 0
  const hasWebResults = (data.results && data.results.length > 0) || (data.similar && data.similar.length > 0)

  // Pagination calculations
  const searchResults = data.results || []
  const relatedResults = data.similar || []
  const totalSearchPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE)
  const totalRelatedPages = Math.ceil(relatedResults.length / ITEMS_PER_PAGE)
  
  const paginatedSearchResults = searchResults.slice(
    (searchPage - 1) * ITEMS_PER_PAGE,
    searchPage * ITEMS_PER_PAGE
  )
  const paginatedRelatedResults = relatedResults.slice(
    (relatedPage - 1) * ITEMS_PER_PAGE,
    relatedPage * ITEMS_PER_PAGE
  )

  // Reset pagination when switching tabs
  const handleTabChange = (tab: 'answer' | 'sources' | 'web') => {
    setActiveTab(tab)
    if (tab === 'web') {
      setSearchPage(1)
      setRelatedPage(1)
    }
  }

  const Pagination = ({ currentPage, totalPages, onPageChange, section }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    section: string
  }) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      {(hasAnswer || hasSources || hasWebResults) && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {hasAnswer && (
                <button
                  onClick={() => handleTabChange('answer')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'answer'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Answer
                </button>
              )}
              {hasSources && (
                <button
                  onClick={() => handleTabChange('sources')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'sources'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Sources
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {data.citations?.length}
                  </span>
                </button>
              )}
              {hasWebResults && (
                <button
                  onClick={() => handleTabChange('web')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'web'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Web
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {(data.results?.length || 0) + (data.similar?.length || 0)}
                  </span>
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Answer Tab Content */}
      {activeTab === 'answer' && (
        <>
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
              </div>
            </section>
          )}

          {/* Related Queries Section */}
          {data.relatedQueries && data.relatedQueries.length > 0 && onQueryClick && (
            <section className="mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">You might also want to know</h3>
                <div className="space-y-3">
                  {data.relatedQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => onQueryClick(query)}
                      className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-gray-900">{query}</span>
                      <svg className="w-5 h-5 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Sources Tab Content */}
      {activeTab === 'sources' && data.citations && data.citations.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sources</h2>
          <div className="space-y-4">
            {data.citations.map((citation, index) => (
              <article key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium mb-2 text-blue-600 hover:text-blue-800">
                        {citation.title || citation.url}
                      </h3>
                      <p className="text-sm text-gray-600">{citation.url}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Web Tab Content */}
      {activeTab === 'web' && (
        <section>
          {/* Search Results Section */}
          {data.results && data.results.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Search Results ({searchResults.length} total)
              </h2>
              <div className="space-y-4">
                {paginatedSearchResults.map((result, index) => (
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
              
              <Pagination
                currentPage={searchPage}
                totalPages={totalSearchPages}
                onPageChange={setSearchPage}
                section="search"
              />
            </div>
          )}

          {/* Similar Results Section */}
          {data.similar && data.similar.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Related Results ({relatedResults.length} total)
              </h2>
              <div className="space-y-4">
                {paginatedRelatedResults.map((result, index) => (
                  <article key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{result.domain}</span>
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
                        <p className="text-sm text-gray-600 mb-3">{result.url}</p>
                        
                        {result.highlights && result.highlights.length > 0 && (
                          <div className="space-y-2">
                            {result.highlights.map((highlight, hIndex) => (
                              <p key={hIndex} className="text-sm text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-400">
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
              
              <Pagination
                currentPage={relatedPage}
                totalPages={totalRelatedPages}
                onPageChange={setRelatedPage}
                section="related"
              />
            </div>
          )}
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
