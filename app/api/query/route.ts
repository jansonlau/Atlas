import { NextRequest, NextResponse } from 'next/server'
import { Exa } from 'exa-js'

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { q } = await request.json()

    // Add caching headers for better performance
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // Default containers
    let answerText: string | null = null
    let citations: Array<{ url: string; title: string }> = []
    let searchResults: any[] = []
    let similarResults: any[] = []

    // Fetch an answer with citations
    try {
      const answerResponse = await exa.answer(q, { text: true })
      answerText = typeof answerResponse.answer === 'string' ? answerResponse.answer : null
      citations = (answerResponse.citations || []).map((citation: any) => ({
        url: citation.url || '',
        title: citation.title || '',
      }))
    } catch (error) {
      console.error('Answer API error:', error)
      // Non-fatal; we can still show search results
    }

    // Fetch search results with text and highlights
    try {
      const searchResponse = await exa.searchAndContents(q, {
        text: true,
        highlights: {
          highlights_per_url: 2,
          num_sentences: 2,
          query: q,
        },
        type: 'auto',
        num_results: 10,
      })

      searchResults = (searchResponse.results || []).map((result: any) => ({
        url: result.url || '',
        title: result.title || '',
        author: result.author || '',
        published_date: result.published_date || '',
        domain: result.domain || '',
        score: result.score || 0,
        highlights: result.highlights || [],
        text: result.text || '',
      }))

      // Sort search results by score (highest first)
      searchResults.sort((a, b) => (b.score || 0) - (a.score || 0))

      // Fetch similar results from the first search result
      if (searchResults.length > 0) {
        try {
          const similarResponse = await exa.findSimilarAndContents(searchResults[0].url, {
            text: true,
            highlights: {
              highlights_per_url: 2,
              num_sentences: 2,
              query: q,
            },
            num_results: 8,
            exclude_source_domain: true,
          })

          similarResults = (similarResponse.results || []).map((result: any) => ({
            url: result.url || '',
            title: result.title || '',
            domain: result.domain || '',
            highlights: result.highlights || [],
          }))
        } catch (error) {
          console.error('Similar API error:', error)
          // Non-fatal; we can still show other results
        }
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
    })
  } catch (error) {
    console.error('Query API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
