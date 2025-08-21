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
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🔦 Exa Spotlight</h1>
          <a 
            href="https://docs.exa.ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline"
          >
            Exa Docs
          </a>
        </header>

        <section className="bg-white rounded-2xl shadow p-6 mb-6">
          <SearchForm onSearch={handleSearch} loading={loading} />
        </section>

        <ErrorBoundary>
          {loading && <LoadingSkeleton />}
          {results && !loading && <CombinedResults data={results} />}
        </ErrorBoundary>
      </div>
    </div>
  )
}
