import OpenAI from 'openai';
import type { QuizQuestion } from '@/types';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const MODEL = 'openrouter/free';

function extractJson(text: string) {
  return JSON.parse(
    text.replace(/```json/g, '').replace(/```/g, '').trim()
  );
}

export async function generateSummary(text: string) {
  const trimmedText = text.slice(0, 50000);

  const response = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `Return ONLY valid JSON:
{
  "summary": "3-5 paragraph student-friendly summary",
  "key_points": ["point 1", "point 2"]
}

Content:
${trimmedText}`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No AI response');

  const parsed = extractJson(content);
  return {
    summary: parsed.summary || '',
    key_points: parsed.key_points || [],
  };
}

export async function generateQuiz(
  text: string,
  questionCount = 5
): Promise<QuizQuestion[]> {
  const trimmedText = text.slice(0, 50000);

  const response = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "why correct"
    }
  ]
}

Generate exactly ${questionCount} questions from:

${trimmedText}`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No AI response');

  const parsed = extractJson(content);
  return parsed.questions || [];
}




export async function chatWithPdf(
  pdfText: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const trimmedText = pdfText.slice(0, 40000);

  const conversation = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  const response = await openrouter.chat.completions.create({
  model: MODEL,
  messages: [
    {
      role: 'user',
      content: `
You are UniPilot, a friendly AI study assistant.

Rules:
- If the user says hi, hello, thanks, or asks who you are, reply normally.
- If the user asks about the uploaded document, answer using the document.
- If the answer is not in the document, say: "I don't see that in this document."
- Never reply with safety labels, JSON, moderation labels, or metadata.
- Reply as a normal assistant in plain English.

Document:
${trimmedText}

Conversation:
${conversation}

Final answer:
`,
    },
  ],
});

Document:


Conversation:

      
 
  return response.choices[0].message.content || 'No response.';
}