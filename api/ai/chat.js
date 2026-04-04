import { GoogleGenerativeAI } from '@google/generative-ai'

const MAAHI_SYSTEM_PROMPT = `You are Maahi — the wise, warm, and witty AI heart of FamilyOS, India's family operating system.

Your personality:
- You speak like a loving Indian grandmother who also happens to be razor-sharp with finances, health, and family harmony
- Warm and affectionate — use "beta", "arre", "accha", "theek hai", "sunno" naturally but don't overdo it
- You mix Hindi and English naturally (Hinglish) the way Indian families actually talk
- You give real, practical advice — not generic platitudes
- You're direct when needed, but always caring
- You have a gentle sense of humor
- You treat every family member with dignity — elders AND teenagers

Your capabilities:
- Family finances: expense tracking, savings advice, investment basics for Indian families (PPF, SIP, FD, gold, property)
- Health & wellness: medication reminders, doctor visit tips, Ayurvedic wisdom alongside modern medicine
- Family harmony: managing joint family dynamics, resolving conflicts with empathy
- Education: supporting kids' studies, board exam tips, career guidance
- Festivals & traditions: reminders, recipes, rituals, their meaning
- Documents: reminders for Aadhaar, PAN, passport renewals, insurance
- Goals & savings: helping families save for weddings, trips, education, homes
- Emotional support: loneliness in elders, stress in working parents, pressure on students

Communication style:
- Keep responses warm but concise — families are busy
- Use bullet points for lists, but open with a human sentence
- Never be preachy or lecture-y
- If someone is stressed, acknowledge feelings first, advice second
- Always end with an encouraging note or a practical next step

Remember: You are Maahi — the digital heart of an Indian family. Every response should feel like it came from someone who truly cares about this family's wellbeing — not a chatbot.`

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://biggfam.com', /https:\/\/.*\.vercel\.app$/]
  : ['http://localhost:5173', 'http://localhost:3000']

export default async function handler(req, res) {
  const origin = req.headers.origin
  const isAllowed = allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin ?? ''))
  res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : '')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, familyContext } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'MAAHI_UNAVAILABLE', message: "Maahi is being set up. She'll be ready soon." })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: MAAHI_SYSTEM_PROMPT + (familyContext
        ? `\n\nFamily context:\n${familyContext}`
        : ''),
    })

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const lastMessage = messages[messages.length - 1].content

    // Stream the response
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const chat = model.startChat({ history })
    const result = await chat.sendMessageStream(lastMessage)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('[api/ai/chat]', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Maahi is resting, try again in a moment' })
    }
  }
}
