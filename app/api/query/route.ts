import { NextRequest, NextResponse } from 'next/server'
import { Exa } from 'exa-js'

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { 
      q, 
      searchType = 'auto',
      contentType = 'all',
      numResults = 10,
      recencyDays = 0,
      language = 'auto',
      includeDomains = [],
      excludeDomains = []
    } = await request.json()

    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // Default containers
    let answerText: string | null = null
    let citations: Array<{ url: string; title: string; summary: string }> = []
    let searchResults: any[] = []
    let similarResults: any[] = []
    let relatedQueries: string[] = []

    // Build search options based on parameters
    const searchOptions: any = {
      summary: true,
      num_results: Math.min(Math.max(numResults, 1), 25) // Limit between 1-25
    }

    // Set search type
    if (searchType && searchType !== 'auto') {
      searchOptions.type = searchType
    }

    // Set content type filters
    if (contentType && contentType !== 'all') {
      switch (contentType) {
        case 'news':
          searchOptions.category = 'news'
          break
        case 'academic':
          searchOptions.category = 'academic'
          break
        case 'blogs':
          searchOptions.category = 'blogs'
          break
        case 'technical':
          searchOptions.category = 'technical'
          break
      }
    }

    // Set language filter
    if (language && language !== 'auto') {
      searchOptions.language = language
    }

    // Set recency filter
    if (recencyDays > 0) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - recencyDays)
      searchOptions.start_published_date = startDate.toISOString().split('T')[0] // YYYY-MM-DD format
    }

    // Add domain filters
    if (includeDomains && includeDomains.length > 0) {
      searchOptions.include_domains = includeDomains
    }

    if (excludeDomains && excludeDomains.length > 0) {
      searchOptions.exclude_domains = excludeDomains
    }

    // Fetch an answer with citations
    try {
      const answerResponse = await exa.answer(q, { text: true })
      answerText = typeof answerResponse.answer === 'string' ? answerResponse.answer : null
      citations = (answerResponse.citations || []).map((citation: any) => ({
        url: citation.url || '',
        title: citation.title || '',
        summary: citation.title || '', // Use title as summary since Exa doesn't provide summary for citations
      }))
    } catch (error) {
      console.error('Answer API error:', error)
      // Non-fatal; we can still show search results
    }

    // Fetch search results
    try {
      const searchResponse = await exa.searchAndContents(q, searchOptions)

      searchResults = (searchResponse.results || []).map((result: any) => ({
        url: result.url || '',
        title: result.title || '',
        domain: result.domain || '',
        favicon: result.favicon || '',
        summary: result.summary || '',
        published_date: result.published_date || null,
        category: result.category || null,
        score: result.score || null
      }))

      // Fetch similar results from the first search result
      if (searchResults.length > 0) {
        try {
          const similarOptions: any = {
            summary: true,
            num_results: 8,
            exclude_source_domain: true
          }

          // Apply domain filters to similar search if specified
          if (includeDomains && includeDomains.length > 0) {
            similarOptions.include_domains = includeDomains
          }
          if (excludeDomains && excludeDomains.length > 0) {
            similarOptions.exclude_domains = excludeDomains
          }

          const similarResponse = await exa.findSimilarAndContents(searchResults[0].url, similarOptions)

          similarResults = (similarResponse.results || []).map((result: any) => ({
            url: result.url || '',
            title: result.title || '',
            domain: result.domain || '',
            favicon: result.favicon || '',
            summary: result.summary || '',
            published_date: result.published_date || null,
            category: result.category || null,
            score: result.score || null
          }))
        } catch (error) {
          console.error('Similar API error:', error)
          // Non-fatal; we can still show other results
        }
      }

      // Generate related queries using Exa's search capabilities
      try {
        // Use the search results to generate related queries
        const queryPrompts = [
          `What are the best ${q.replace(/what|how|why|when|where|is|are|do|does|can|could|should|would|will/i, '').trim()}`,
          `How to choose ${q.replace(/what|how|why|when|where|is|are|do|does|can|could|should|would|will/i, '').trim()}`,
          `Compare ${q.replace(/what|how|why|when|where|is|are|do|does|can|could|should|would|will/i, '').trim()}`,
          `Top ${q.replace(/what|how|why|when|where|is|are|do|does|can|could|should|would|will/i, '').trim()}`,
          `Guide to ${q.replace(/what|how|why|when|where|is|are|do|does|can|could|should|would|will/i, '').trim()}`
        ]

        // Filter out queries that are too short or invalid
        relatedQueries = queryPrompts
          .map(query => query.trim())
          .filter(query => query.length > 10 && query !== q)
          .slice(0, 5)

        // If we don't have enough queries, add some generic ones
        if (relatedQueries.length < 5) {
          const fallbackQueries = [
            "What are the key features to consider?",
            "How do I compare different options?",
            "What are the pros and cons?",
            "Which one is the best choice?",
            "What should I know before deciding?"
          ]
          relatedQueries = [...relatedQueries, ...fallbackQueries.slice(0, 5 - relatedQueries.length)]
        }
      } catch (error) {
        console.error('Related queries generation error:', error)
        // Non-fatal; we can still show other results
      }
    } catch (error) {
      console.error('Search API error:', error)
      // Non-fatal; we can still show answer
    }

    return NextResponse.json({
      question: q,
      answer: answerText,
      citations,
      results: searchResults,
      similar: similarResults,
      relatedQueries,
      searchType,
      contentType,
      numResults: searchResults.length,
      recencyDays,
      language,
      includeDomains,
      excludeDomains
    })
  } catch (error) {
    console.error('Query API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
