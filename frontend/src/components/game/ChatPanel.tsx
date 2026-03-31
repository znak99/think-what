import { useEffect, useRef, useState } from 'react'
import type { ChatMsg } from '../../types/game'

interface Props {
  messages: ChatMsg[]
  onSend: (msg: string) => void
}

export default function ChatPanel({ messages, onSend }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = input.trim()
    if (!msg) return
    onSend(msg)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[#21262d] shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7d8590]">채팅</p>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-1 text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className="animate-slide-up">
            {msg.isSystem ? (
              /* 시스템 메시지 */
              <div className={`text-center text-xs py-1 px-2 rounded ${
                msg.isCorrect
                  ? 'text-green-400 bg-green-400/10 font-semibold'
                  : 'text-[#7d8590]'
              }`}>
                {msg.message}
              </div>
            ) : (
              /* 일반 채팅 */
              <div>
                <span className="text-[#7d8590] text-xs mr-1.5">{msg.nickname}</span>
                <span className="text-[#e6edf3] break-all">{msg.message}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#21262d] shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="채팅 또는 초성 입력..."
            maxLength={100}
            className="w-full px-3 py-2 pr-10 rounded-lg bg-[#161b22] border border-[#21262d] text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-green-400/50 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md bg-green-400 hover:bg-green-300 text-black text-xs font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ▶
          </button>
        </div>
      </form>
    </div>
  )
}
