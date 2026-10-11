import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = 'gemini-2.5-flash', systemInstruction } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are assisting an on-device LiteRT-LM Autonomous Agent in performing cloud distillation, cross-evaluation, and complex planning.',
        temperature: 0.7,
      }
    });

    return NextResponse.json({
      text: response.text || '',
      modelUsed: model,
      source: 'gemini-cloud-bridge'
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/chat:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error processing Gemini request' },
      { status: 500 }
    );
  }
}
