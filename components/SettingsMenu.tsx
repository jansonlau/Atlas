'use client'

import { useState } from 'react'

interface SettingsMenuProps {
  onSearchTypeChange: (searchType: string) => void
  onContentTypeChange: (contentType: string) => void
  onNumResultsChange: (numResults: number) => void
  onRecencyChange: (recencyDays: number) => void
  onLanguageChange: (language: string) => void
  onIncludeDomainsChange: (domains: string[]) => void
  onExcludeDomainsChange: (domains: string[]) => void
  currentSearchType: string
  currentContentType: string
  currentNumResults: number
  recencyDays: number
  language: string
  includeDomains: string[]
  excludeDomains: string[]
}

const SEARCH_TYPES = [
  { id: 'auto', name: 'Auto', description: 'Recommended for most queries' },
  { id: 'keyword', name: 'Keyword', description: 'Traditional keyword-based search' },
  { id: 'neural', name: 'Neural', description: 'AI-powered semantic search' },
  { id: 'fast', name: 'Fast', description: 'Quick search with optimized performance' }
]

const CONTENT_TYPES = [
  { id: 'all', name: 'All Content', description: 'Search across all content types' },
  { id: 'news', name: 'News', description: 'Recent news and articles' },
  { id: 'academic', name: 'Academic', description: 'Research papers and academic content' },
  { id: 'blogs', name: 'Blogs', description: 'Blog posts and personal content' },
  { id: 'technical', name: 'Technical', description: 'Technical documentation and guides' }
]

const NUM_RESULTS_OPTIONS = [5, 10, 15, 20, 25]

const RECENCY_OPTIONS = [
  { value: 0, label: 'Any time' },
  { value: 1, label: 'Past 24 hours' },
  { value: 7, label: 'Past week' },
  { value: 30, label: 'Past month' },
  { value: 90, label: 'Past 3 months' },
  { value: 365, label: 'Past year' }
]

const LANGUAGE_OPTIONS = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' }
]

export default function SettingsMenu({
  onSearchTypeChange,
  onContentTypeChange,
  onNumResultsChange,
  onRecencyChange,
  onLanguageChange,
  onIncludeDomainsChange,
  onExcludeDomainsChange,
  currentSearchType,
  currentContentType,
  currentNumResults,
  recencyDays,
  language,
  includeDomains,
  excludeDomains
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('search')
  const [includeDomainsInput, setIncludeDomainsInput] = useState(includeDomains.join(', '))
  const [excludeDomainsInput, setExcludeDomainsInput] = useState(excludeDomains.join(', '))

  const handleIncludeDomainsChange = () => {
    const domains = includeDomainsInput
      .split(',')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0)
    onIncludeDomainsChange(domains)
  }

  const handleExcludeDomainsChange = () => {
    const domains = excludeDomainsInput
      .split(',')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0)
    onExcludeDomainsChange(domains)
  }

  const getActiveSettingsCount = () => {
    let count = 0
    if (currentSearchType !== 'auto') count++
    if (currentContentType !== 'all') count++
    if (currentNumResults !== 10) count++
    if (recencyDays > 0) count++
    if (language !== 'auto') count++
    if (includeDomains.length > 0) count++
    if (excludeDomains.length > 0) count++
    return count
  }

  const activeSettingsCount = getActiveSettingsCount()

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
        {activeSettingsCount > 0 && (
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
            {activeSettingsCount}
          </span>
        )}
        <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Settings</h3>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab('filters')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'filters'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Filters
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'advanced'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Advanced
              </button>
            </div>

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-4">
                {/* Search Type */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Search Type</h4>
                  <div className="space-y-1">
                    {SEARCH_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => onSearchTypeChange(type.id)}
                        className={`w-full text-left p-2 rounded border transition-all duration-200 ${
                          currentSearchType === type.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Type */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Content Type</h4>
                  <div className="space-y-1">
                    {CONTENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => onContentTypeChange(type.id)}
                        className={`w-full text-left p-2 rounded border transition-all duration-200 ${
                          currentContentType === type.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Results */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Results Count</h4>
                  <div className="grid grid-cols-5 gap-1">
                    {NUM_RESULTS_OPTIONS.map((num) => (
                      <button
                        key={num}
                        onClick={() => onNumResultsChange(num)}
                        className={`p-2 text-xs font-medium rounded border transition-all duration-200 ${
                          currentNumResults === num
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <div className="space-y-4">
                {/* Recency Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Time Range</h4>
                  <div className="space-y-1">
                    {RECENCY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onRecencyChange(option.value)}
                        className={`w-full text-left p-2 rounded border transition-all duration-200 ${
                          recencyDays === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Language</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code)}
                        className={`p-2 text-xs font-medium rounded border transition-all duration-200 ${
                          language === lang.code
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                {/* Domain Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Domain Filters</h4>
                  
                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Include Domains</label>
                    <input
                      type="text"
                      value={includeDomainsInput}
                      onChange={(e) => setIncludeDomainsInput(e.target.value)}
                      onBlur={handleIncludeDomainsChange}
                      placeholder="example.com, docs.example.com"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Exclude Domains</label>
                    <input
                      type="text"
                      value={excludeDomainsInput}
                      onChange={(e) => setExcludeDomainsInput(e.target.value)}
                      onBlur={handleExcludeDomainsChange}
                      placeholder="spam.com, ads.example.com"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Current Settings Summary */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Active Settings</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    {currentSearchType !== 'auto' && (
                      <div>Search: {SEARCH_TYPES.find(t => t.id === currentSearchType)?.name}</div>
                    )}
                    {currentContentType !== 'all' && (
                      <div>Content: {CONTENT_TYPES.find(t => t.id === currentContentType)?.name}</div>
                    )}
                    {currentNumResults !== 10 && (
                      <div>Results: {currentNumResults}</div>
                    )}
                    {recencyDays > 0 && (
                      <div>Time: {RECENCY_OPTIONS.find(r => r.value === recencyDays)?.label}</div>
                    )}
                    {language !== 'auto' && (
                      <div>Language: {LANGUAGE_OPTIONS.find(l => l.code === language)?.name}</div>
                    )}
                    {includeDomains.length > 0 && (
                      <div>Include: {includeDomains.join(', ')}</div>
                    )}
                    {excludeDomains.length > 0 && (
                      <div>Exclude: {excludeDomains.join(', ')}</div>
                    )}
                    {activeSettingsCount === 0 && (
                      <div className="text-gray-400">No custom settings applied</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
