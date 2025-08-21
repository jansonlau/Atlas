import { NextRequest, NextResponse } from 'next/server'
import { Exa } from 'exa-js'

const exa = new Exa(process.env.EXA_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { url, q = '' } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    const similar = await exa.findSimilarAndContents(url, {
      text: true,
      highlights: {
        highlights_per_url: 2,
        num_sentences: 2,
        query: q || 'similar',
      },
      summary: true,
      num_results: 10,
      exclude_source_domain: true,
    })

    const items = (similar.results || []).map((result: any) => ({
      url: result.url || '',
      title: result.title || '',
      domain: result.domain || '',
      highlights: result.highlights || [],
      favicon: result.favicon || '',
      summary: result.summary || '',
    }))

    return NextResponse.json({
      url,
      similar: items,
    })
  } catch (error) {
    console.error('Similar API error:', error)
    return NextResponse.json(
      { error: 'Failed to find similar pages' },
      { status: 500 }
    )
  }
}
