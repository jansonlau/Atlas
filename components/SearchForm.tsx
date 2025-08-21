'use client'

import { useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface SearchFormProps {
  onSearch: (query: string) => void
  loading: boolean
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [query, setQuery] = useState('')

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebouncedCallback(
    (searchQuery: string) => {
      if (searchQuery.trim() && !loading) {
        onSearch(searchQuery.trim())
      }
    },
    500 // 500ms delay
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !loading) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search or ask a question..."
        className="flex-1 rounded-2xl border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
        required
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="bg-slate-900 text-white rounded-2xl px-5 py-3 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}
