'use client'

import { useState, useCallback } from 'react'
import SearchForm from '@/components/SearchForm'
import CombinedResults from '@/components/CombinedResults'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { SearchResponse } from '@/types'

export default function Home() {
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
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
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Atlas</h1>
          </div>

          {/* Search Section */}
          <div className="mb-12">
            <SearchForm onSearch={handleSearch} loading={loading} />
          </div>

          <ErrorBoundary>
            {loading && <LoadingSkeleton />}
            {results && !loading && <CombinedResults data={results} />}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
