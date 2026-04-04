import { useState, useRef, useEffect } from 'react'
import './MaahiAI.css'

const SUGGESTED_PROMPTS = [
  'How can we save more as a family this month?',
  'Dadaji ko diabetes hai — kya khaana avoid karein?',
  'Tips for reducing family stress during exam season',
  'Help me plan a budget trip to Goa for 5 people',
  'How to talk to teenagers about screen time?',
  'Remind me what documents need renewal every year',
]

export default function MaahiAI({ familyContext = '' }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste beta! 🙏 Main hoon Maahi — aapke parivar ki AI companion. Finances ho, health ho, family ke sawaal ho — sab pooch sakte ho. Aaj main kaise madad kar sakti hoon?',
    },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userText = text || input.trim()
    if (!userText || streaming) return

    setInput('')
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setStreaming(true)

    // Add empty assistant message that we'll stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, familyContext }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Something went wrong')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const { text } = JSON.parse(data)
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                role: 'assistant',
                content: updated[updated.length - 1].content + text,
              }
              return updated
            })
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        if (err.message === 'MAAHI_UNAVAILABLE') {
          updated[updated.length - 1] = {
            role: 'assistant',
            content: "Maahi is being set up. She'll be ready soon. 🙏",
          }
        } else {
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Arre beta, kuch technical problem aa gayi. Ek baar phir try karo. (${err.message})`,
          }
        }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="maahi-page">
      {/* Header */}
      <div className="maahi-header">
        <div className="maahi-avatar">🧓🏽</div>
        <div className="maahi-header-text">
          <h1>Maahi</h1>
          <span className="maahi-status">
            {streaming ? (
              <><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /> typing…</>
            ) : (
              <><span className="online-dot" /> Online — ready to help</>
            )}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="maahi-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`maahi-bubble-wrap ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="maahi-bubble-avatar">🧓🏽</div>
            )}
            <div className={`maahi-bubble ${msg.role}`}>
              {msg.content
                ? formatMessage(msg.content)
                : <span className="maahi-thinking"><span /><span /><span /></span>
              }
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — only shown before user sends first message */}
      {messages.length === 1 && (
        <div className="maahi-suggestions">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              className="maahi-suggestion-chip"
              onClick={() => sendMessage(p)}
              disabled={streaming}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="maahi-input-bar">
        <textarea
          ref={inputRef}
          className="maahi-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Kuch bhi pooch sakte ho…"
          rows={1}
          disabled={streaming}
        />
        <button
          className="maahi-send"
          onClick={() => sendMessage()}
          disabled={!input.trim() || streaming}
          aria-label="Send message"
        >
          {streaming ? '…' : '➤'}
        </button>
      </div>
    </div>
  )
}

// Simple markdown-ish formatter — bold, bullets, line breaks
function formatMessage(text) {
  const lines = text.split('\n')
  return (
    <div className="maahi-text">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />

        // Bullet points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return (
            <div key={i} className="maahi-bullet">
              <span className="bullet-dot">•</span>
              <span>{applyBold(line.trim().slice(2))}</span>
            </div>
          )
        }

        // Numbered list
        if (/^\d+\.\s/.test(line.trim())) {
          return <div key={i} className="maahi-numbered">{applyBold(line.trim())}</div>
        }

        return <p key={i} style={{ margin: '4px 0' }}>{applyBold(line)}</p>
      })}
    </div>
  )
}

function applyBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}
