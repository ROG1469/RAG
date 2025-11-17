import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { question, name, email } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // If name and email provided, just save to customer_queries
    if (name && email) {
      const supabase = createServiceClient(supabaseUrl, supabaseServiceKey)
      
      await supabase
        .from('customer_queries')
        .insert({
          question,
          customer_name: name,
          customer_email: email,
          status: 'pending',
        })

      return NextResponse.json({ success: true })
    }

    // Otherwise, try to answer the question
    const queryUrl = `${supabaseUrl}/functions/v1/query-rag`
    
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        customerMode: true, // Filter for customer-accessible documents only
      }),
    })

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text()
      console.error('Query-RAG error:', errorText)
      return NextResponse.json({ error: 'Failed to process query' }, { status: 500 })
    }

    const result = await queryResponse.json()

    // Check if we got a meaningful answer
    if (!result.answer || result.answer.includes('I don\'t have enough information') || result.sources.length === 0) {
      return NextResponse.json({ noAnswer: true })
    }

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
    })

  } catch (error) {
    console.error('Customer query error:', error)
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    )
  }
}
