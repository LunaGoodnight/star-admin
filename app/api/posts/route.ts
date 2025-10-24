import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, content } = body

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            )
        }

        // Get API key from environment variable (server-side only)
        const apiKey = process.env.API_KEY

        if (!apiKey) {
            console.error('API_KEY is not configured')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        // Make the request to your external API
        const response = await fetch('https://api.star.vividcats.org/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
            },
            body: JSON.stringify({ title, content }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('External API error:', errorText)
            return NextResponse.json(
                { error: `Failed to submit post: ${response.statusText}` },
                { status: response.status }
            )
        }

        const result = await response.json()
        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        console.error('Error in POST /api/posts:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
