import { NextRequest, NextResponse } from 'next/server'
import { Exa } from 'exa-js'

const exa = new Exa(process.env.EXA_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, q = '', num_results = 8 } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Find similar pages
    const results = await exa.findSimilarAndContents(url, {
      summary: true,
      num_results: Math.max(1, Math.min(20, num_results)),
      exclude_source_domain: true,
    })

    // Normalize results
    const items = (results.results || []).map((result: any) => ({
      url: result.url || '',
      title: result.title || '',
      domain: result.domain || '',
      favicon: result.favicon || '',
      summary: result.summary || '',
    }))

    return NextResponse.json({
      url,
      query: q,
      results: items,
    })
  } catch (error) {
    console.error('Similar API error:', error)
    return NextResponse.json(
      { error: 'Similar search failed' },
      { status: 500 }
    )
  }
}
