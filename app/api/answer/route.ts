import { NextRequest, NextResponse } from 'next/server'
import { Exa } from 'exa-js'

const exa = new Exa(process.env.EXA_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question parameter is required' },
        { status: 400 }
      )
    }

    const response = await exa.answer(question, { text: true })

    const answerText = response.answer || null
    const citations = (response.citations || []).map((citation: any) => ({
      url: citation.url || '',
      title: citation.title || '',
    }))

    return NextResponse.json({
      question,
      answer: answerText,
      citations,
    })
  } catch (error) {
    console.error('Answer API error:', error)
    return NextResponse.json(
      { error: 'Failed to get answer' },
      { status: 500 }
    )
  }
}
