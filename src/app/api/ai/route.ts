import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const CANDIDATE_MODELS = [
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.1-8b-instant',
  'llama3-8b-8192',
];

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GROQ_API_KEY no encontrada en las variables de entorno (.env.local).',
        },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });
    const body = await req.json();
    const { prompt, context = 'chat', history = [] } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'El campo "prompt" es requerido.' },
        { status: 400 }
      );
    }

    let systemPrompt = '';
    let temperature = 0.7;

    if (context === 'post_assistant') {
      systemPrompt =
        'Eres el Asistente Editorial de IA de Aemora, una red social moderna especializada en ciberseguridad, arquitectura limpia, diseño y comunidad tecnológica. ' +
        'Tu tarea es tomar la idea o borrador del usuario y transformarla en una publicación brillante, concisa, atractiva y profesional para el feed de Aemora. ' +
        'Incluye un gancho inicial llamativo, formato limpio y 2-3 hashtags estratégicos (#aemora, #cybersecurity, #cleancode, etc.). ' +
        'Devuelve ÚNICAMENTE el texto final de la publicación optimizada, sin prefacios, explicaciones ni comillas envolventes.';
      temperature = 0.6;
    } else {
      systemPrompt =
        'Eres Aemora AI ✨, la inteligencia artificial oficial y compañera de la red social Aemora. ' +
        'Eres un Staff Software Architect y experto en ciberseguridad web (OWASP Top 10), Clean Architecture, diseño de productos y tecnologías emergentes. ' +
        'Tu tono es amigable, colaborativo, inteligente, conciso y respetuoso con la privacidad de los usuarios. Responde en español con formato Markdown limpio.';
      temperature = 0.7;
    }

    // Estructurar mensajes con historial si existe
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-6)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: String(msg.content),
          });
        }
      }
    }

    messages.push({ role: 'user', content: prompt.trim() });

    // Intento con cascada de modelos disponibles en la cuenta de Groq
    let completionText = '';
    let usedModel = '';
    let lastError: unknown = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages,
          model,
          temperature,
          max_tokens: 1024,
          top_p: 1,
        });

        completionText =
          chatCompletion.choices[0]?.message?.content ||
          'No se pudo generar respuesta de Aemora AI.';
        usedModel = model;
        break; // Éxito, salir del loop
      } catch (err: unknown) {
        lastError = err;
        // Si el modelo no existe o no tiene acceso, probar el siguiente
        continue;
      }
    }

    if (!completionText && lastError) {
      throw lastError;
    }

    return NextResponse.json({
      result: completionText,
      model: usedModel,
    });
  } catch (error: unknown) {
    console.error('Error en Groq AI Route Handler:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Error interno al procesar con Groq AI.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
