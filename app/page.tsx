'use client'

import { useState, useCallback } from 'react'
import SearchForm from '@/components/SearchForm'
import CombinedResults from '@/components/CombinedResults'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import SettingsMenu from '@/components/SettingsMenu'
import { SearchResponse } from '@/types'

export default function Home() {
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasEverHadResults, setHasEverHadResults] = useState(false)
  const [currentQuery, setCurrentQuery] = useState<string>('')
  
  // Settings state
  const [searchType, setSearchType] = useState('auto')
  const [contentType, setContentType] = useState('all')
  const [numResults, setNumResults] = useState(10)
  const [recencyDays, setRecencyDays] = useState(0)
  const [language, setLanguage] = useState('auto')
  const [includeDomains, setIncludeDomains] = useState<string[]>([])
  const [excludeDomains, setExcludeDomains] = useState<string[]>([])

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true)
    setHasEverHadResults(true) // Set immediately when search starts
    setCurrentQuery(query) // Store the current query
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          q: query,
          searchType,
          contentType,
          numResults,
          recencyDays,
          language,
          includeDomains,
          excludeDomains
        }),
      })
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults({ error: 'Search failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }, [searchType, contentType, numResults, recencyDays, language, includeDomains, excludeDomains])

  const handleQueryClick = useCallback((query: string) => {
    handleSearch(query)
  }, [handleSearch])

  // Settings handlers
  const handleSearchTypeChange = useCallback((newSearchType: string) => {
    setSearchType(newSearchType)
  }, [])

  const handleContentTypeChange = useCallback((newContentType: string) => {
    setContentType(newContentType)
  }, [])

  const handleNumResultsChange = useCallback((newNumResults: number) => {
    setNumResults(newNumResults)
  }, [])

  const handleRecencyChange = useCallback((newRecencyDays: number) => {
    setRecencyDays(newRecencyDays)
  }, [])

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage)
  }, [])

  const handleIncludeDomainsChange = useCallback((newIncludeDomains: string[]) => {
    setIncludeDomains(newIncludeDomains)
  }, [])

  const handleExcludeDomainsChange = useCallback((newExcludeDomains: string[]) => {
    setExcludeDomains(newExcludeDomains)
  }, [])

  // Check if we should show the bottom search layout
  const shouldShowBottomSearch = hasEverHadResults

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className={`flex-1 ${shouldShowBottomSearch ? 'flex flex-col' : 'flex flex-col justify-center'}`}>
        <div className={`w-full mx-auto px-4 py-8 ${shouldShowBottomSearch ? 'pb-20' : ''}`}>
          {/* Title - only shown when no results */}
          {!shouldShowBottomSearch && (
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Atlas</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Understand anything with AI search
              </p>
            </div>
          )}

          {/* Initial Search Section - centered when no results */}
          {!shouldShowBottomSearch && (
            <div className="mb-12">
              <SearchForm onSearch={handleSearch} loading={loading} variant="centered" />
            </div>
          )}

          {/* Results Section */}
          <ErrorBoundary>
            {loading && <LoadingSkeleton />}
            {results && !loading && <CombinedResults data={results} onQueryClick={handleQueryClick} currentQuery={currentQuery} />}
          </ErrorBoundary>
        </div>
      </main>

      {/* Fixed Bottom Search Section - appears after first query */}
      {shouldShowBottomSearch && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="w-full mx-auto px-4 py-2">
            <div className="flex items-center gap-4 max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Atlas</h1>
              <div className="flex-1">
                <SearchForm onSearch={handleSearch} loading={loading} variant="inline" />
              </div>
              <SettingsMenu
                onSearchTypeChange={handleSearchTypeChange}
                onContentTypeChange={handleContentTypeChange}
                onNumResultsChange={handleNumResultsChange}
                onRecencyChange={handleRecencyChange}
                onLanguageChange={handleLanguageChange}
                onIncludeDomainsChange={handleIncludeDomainsChange}
                onExcludeDomainsChange={handleExcludeDomainsChange}
                currentSearchType={searchType}
                currentContentType={contentType}
                currentNumResults={numResults}
                recencyDays={recencyDays}
                language={language}
                includeDomains={includeDomains}
                excludeDomains={excludeDomains}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
