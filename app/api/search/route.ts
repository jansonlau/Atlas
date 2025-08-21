import { NextRequest, NextResponse } from 'next/server'
import { Exa } from 'exa-js'

const exa = new Exa(process.env.EXA_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      q,
      include_domains = '',
      exclude_domains = '',
      recency_days = 0,
      num_results = 10,
      highlights_per_url = 2,
      include_text = true,
    } = body

    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // Parse CSV strings
    const include = include_domains ? include_domains.split(',').map(d => d.trim()).filter(Boolean) : null
    const exclude = exclude_domains ? exclude_domains.split(',').map(d => d.trim()).filter(Boolean) : null

    // Calculate start date for recency filter
    let startDate: string | null = null
    if (recency_days > 0) {
      const start = new Date()
      start.setDate(start.getDate() - recency_days)
      startDate = start.toISOString().split('T')[0] // YYYY-MM-DD format
    }

    // Build search options
    const options: any = {
      type: 'auto',
      num_results: Math.max(1, Math.min(50, num_results)),
    }

    if (include) options.include_domains = include
    if (exclude) options.exclude_domains = exclude
    if (startDate) options.start_published_date = startDate

    // Configure highlights
    const highlights = {
      highlights_per_url: Math.max(0, highlights_per_url),
      num_sentences: 2,
      query: q,
    }

    // Perform search
    const results = await exa.searchAndContents(q, {
      text: include_text,
      highlights,
      ...options,
    })

    // Normalize results
    const items = (results.results || []).map((result: any) => ({
      url: result.url || '',
      title: result.title || '',
      author: result.author || '',
      published_date: result.published_date || '',
      domain: result.domain || '',
      score: result.score || 0,
      highlights: result.highlights || [],
      text: result.text || '',
    }))

    return NextResponse.json({
      query: q,
      results: items,
      include_domains: include || [],
      exclude_domains: exclude || [],
      recency_days,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
