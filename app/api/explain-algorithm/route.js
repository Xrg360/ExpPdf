import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }


    // Make the API call with the key as a query parameter
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: `Gemini API responded with status ${response.status}` }, { status: response.status });
    }

    const result = await response.json();

    if (!result.candidates || result.candidates.length === 0) {
      console.error('No explanation generated');
      return NextResponse.json({ error: 'No explanation generated' }, { status: 500 });
    }

    const explanation = result.candidates[0].content.parts[0].text;
    return NextResponse.json({ explanation });

  } catch (error) {
    console.error('Error in explain-algorithm route:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
