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
    let relatedQueries: string[] = []

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

      // Generate intelligent related queries using search results analysis
      try {
        // Extract key terms and concepts from search results
        const allTitles = searchResults.map(r => r.title).join(' ')
        const allHighlights = searchResults.flatMap(r => r.highlights || []).join(' ')
        const combinedContent = `${allTitles} ${allHighlights}`.toLowerCase()

        // Identify the main topic/entity from the original query
        const topicKeywords = q.toLowerCase()
          .replace(/what|how|why|when|where|is|are|do|does|can|could|should|would|will|best|top|good|bad/gi, '')
          .trim()
          .split(' ')
          .filter(word => word.length > 2)

        // Generate intelligent queries based on search results analysis
        const intelligentQueries = []

        // 1. Comparison query - look for competing products/services
        if (combinedContent.includes('vs') || combinedContent.includes('compare') || combinedContent.includes('alternative')) {
          intelligentQueries.push(`Compare ${topicKeywords.slice(0, 2).join(' ')} alternatives`)
        } else {
          intelligentQueries.push(`What are the best ${topicKeywords.slice(0, 2).join(' ')} alternatives?`)
        }

        // 2. How-to/guide query
        intelligentQueries.push(`How to choose the right ${topicKeywords.slice(0, 2).join(' ')}`)

        // 3. Features/benefits query
        if (combinedContent.includes('feature') || combinedContent.includes('benefit')) {
          intelligentQueries.push(`Key features of ${topicKeywords.slice(0, 2).join(' ')}`)
        } else {
          intelligentQueries.push(`What are the main benefits of ${topicKeywords.slice(0, 2).join(' ')}?`)
        }

        // 4. Price/cost query
        if (combinedContent.includes('price') || combinedContent.includes('cost') || combinedContent.includes('budget')) {
          intelligentQueries.push(`${topicKeywords.slice(0, 2).join(' ')} pricing and cost comparison`)
        } else {
          intelligentQueries.push(`How much does ${topicKeywords.slice(0, 2).join(' ')} cost?`)
        }

        // 5. Problems/issues query
        if (combinedContent.includes('problem') || combinedContent.includes('issue') || combinedContent.includes('disadvantage')) {
          intelligentQueries.push(`Common problems with ${topicKeywords.slice(0, 2).join(' ')}`)
        } else {
          intelligentQueries.push(`What to avoid when choosing ${topicKeywords.slice(0, 2).join(' ')}`)
        }

        // Filter and clean queries
        relatedQueries = intelligentQueries
          .map(query => query.trim())
          .filter(query => query.length > 10 && query !== q && !query.includes('undefined'))
          .slice(0, 5)

        // Enhanced fallback queries based on search context
        if (relatedQueries.length < 5) {
          const contextualFallbacks = [
            `Top ${topicKeywords[0]} recommendations`,
            `${topicKeywords[0]} buying guide`,
            `Best ${topicKeywords[0]} for beginners`,
            `${topicKeywords[0]} reviews and ratings`,
            `Latest ${topicKeywords[0]} trends`
          ].filter(query => !query.includes('undefined'))

          const remainingSlots = 5 - relatedQueries.length
          relatedQueries = [...relatedQueries, ...contextualFallbacks.slice(0, remainingSlots)]
        }

        // Final cleanup - ensure all queries are valid
        relatedQueries = relatedQueries.filter(query => 
          query && 
          query.length > 10 && 
          !query.includes('undefined') && 
          query !== q
        )

      } catch (error) {
        console.error('Intelligent related queries generation error:', error)
        
        // Fallback to simpler but still contextual queries
        const simpleTopic = q.replace(/what|how|why|when|where|is|are|do|does|can|could|should|would|will/gi, '').trim()
        relatedQueries = [
          `Best ${simpleTopic} options`,
          `How to choose ${simpleTopic}`,
          `${simpleTopic} comparison guide`,
          `${simpleTopic} reviews`,
          `${simpleTopic} buying tips`
        ].filter(query => query.length > 10 && !query.includes('undefined'))
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
    })
  } catch (error) {
    console.error('Query API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
