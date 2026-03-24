import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Canvas, { type CanvasHandle } from '../../components/game/Canvas'
import ChatPanel from '../../components/game/ChatPanel'
import PlayerList from '../../components/game/PlayerList'
import Toolbar from '../../components/game/Toolbar'
import { useAuth } from '../../hooks/useAuth'
import { useWebSocket } from '../../hooks/useWebSocket'
import type {
  ChatMsg, DrawEvent, GamePhase, PlayerInfo, RoundEndResult, VoteStatus,
} from '../../types/game'
import { getUserIdFromToken } from '../../utils/token'

const MY_USER_ID = getUserIdFromToken()

export default function GamePage() {
  const navigate = useNavigate()
  const { clearTokens } = useAuth()
  const canvasRef = useRef<CanvasHandle>(null)

  // ── 게임 상태 ──────────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>('waiting')
  const [players, setPlayers] = useState<PlayerInfo[]>([])
  const [questionerId, setQuestionerId] = useState<number | null>(null)
  const [consonants, setConsonants] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(180)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [voteStatus, setVoteStatus] = useState<VoteStatus | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [roundResult, setRoundResult] = useState<RoundEndResult | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [currentColor, setCurrentColor] = useState('#FFFFFF')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idCounter = useRef(0)

  function newId() { return String(idCounter.current++) }

  function addMessage(msg: Omit<ChatMsg, 'id'>) {
    setMessages(prev => [...prev.slice(-199), { ...msg, id: newId() }])
  }

  // ── 타이머 ─────────────────────────────────────────────────
  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeLeft(180)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  useEffect(() => () => stopTimer(), [])

  // ── WS 이벤트 핸들러 ───────────────────────────────────────
  const handlers = {
    game_start: useCallback((payload: Record<string, unknown>) => {
      const ps = payload.players as PlayerInfo[]
      setPlayers(ps)
      setQuestionerId(payload.questioner_id as number)
      setConsonants(payload.consonants as string)
      setVoteStatus(null)
      setHasVoted(false)
      setRoundResult(null)
      canvasRef.current?.clearCanvas()

      // 3초 카운트다운 후 플레이
      setPhase('countdown')
      setCountdown(3)
      let n = 3
      const cd = setInterval(() => {
        n--
        setCountdown(n)
        if (n <= 0) {
          clearInterval(cd)
          setPhase('playing')
          startTimer()
        }
      }, 1000)
    }, []),

    game_end: useCallback((payload: Record<string, unknown>) => {
      stopTimer()
      const winnerId = payload.winner_id as number | null
      const winnerNickname = players.find(p => p.user_id === winnerId)?.nickname ?? null
      setRoundResult({
        winner_id: winnerId,
        winner_nickname: winnerNickname,
        word: payload.word as string | null,
        consonants: payload.consonants as string | null,
      })
      setPhase('round_end')
      addMessage({
        user_id: 0, nickname: '',
        message: winnerId
          ? `🎉 ${winnerNickname} 님이 정답을 맞췄습니다! 정답: ${payload.word}`
          : `⏰ 시간 초과! 정답은 "${payload.word}" 이었습니다.`,
        isSystem: true, isCorrect: !!winnerId,
      })
    }, [players]),

    player_join: useCallback((payload: Record<string, unknown>) => {
      setPlayers(prev => {
        const exists = prev.find(p => p.user_id === (payload.user_id as number))
        if (exists) return prev
        return [...prev, { user_id: payload.user_id as number, nickname: payload.nickname as string, rank_points: payload.rank_points as number }]
      })
      addMessage({ user_id: 0, nickname: '', message: `${payload.nickname} 님이 입장했습니다.`, isSystem: true })
    }, []),

    player_leave: useCallback((payload: Record<string, unknown>) => {
      const leaving = players.find(p => p.user_id === (payload.user_id as number))
      setPlayers(prev => prev.filter(p => p.user_id !== (payload.user_id as number)))
      if (leaving) addMessage({ user_id: 0, nickname: '', message: `${leaving.nickname} 님이 퇴장했습니다.`, isSystem: true })
    }, [players]),

    chat: useCallback((payload: Record<string, unknown>) => {
      addMessage({ user_id: payload.user_id as number, nickname: payload.nickname as string, message: payload.message as string })
    }, []),

    correct: useCallback((payload: Record<string, unknown>) => {
      addMessage({
        user_id: payload.user_id as number, nickname: payload.nickname as string,
        message: `${payload.nickname} 님 정답!`, isSystem: true, isCorrect: true,
      })
    }, []),

    draw: useCallback((payload: Record<string, unknown>) => {
      canvasRef.current?.drawStroke(payload as unknown as DrawEvent)
    }, []),

    clear: useCallback(() => {
      canvasRef.current?.clearCanvas()
    }, []),

    canvas_replay: useCallback((payload: Record<string, unknown>) => {
      canvasRef.current?.replayEvents(payload.events as DrawEvent[])
    }, []),

    vote_kick: useCallback((payload: Record<string, unknown>) => {
      setVoteStatus({ votes: payload.votes as number, required: payload.required as number })
    }, []),
  }

  const { sendChat, sendDraw, sendClear, sendVoteKick } = useWebSocket(handlers)

  const isQuestioner = MY_USER_ID !== null && questionerId === MY_USER_ID

  function handleDraw(e: DrawEvent) {
    sendDraw(e)
  }

  function handleClear() {
    canvasRef.current?.clearCanvas()
    sendClear()
  }

  function handleVoteKick() {
    setHasVoted(true)
    sendVoteKick()
  }

  function handleLogout() {
    clearTokens()
    navigate('/login', { replace: true })
  }

  // ── 타이머 색상 ────────────────────────────────────────────
  const timerColor =
    timeLeft <= 10 ? 'text-red-500' :
    timeLeft <= 30 ? 'text-yellow-400' :
    'text-[#e6edf3]'

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="h-screen bg-base bg-dot-grid bg-[size:24px_24px] flex flex-col overflow-hidden">

      {/* ── HUD ─────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-4 px-6 py-3 bg-[#0d1117]/80 backdrop-blur border-b border-[#21262d]">
        <span className="font-mono text-sm font-bold tracking-widest text-[#e6edf3]">
          THINK<span className="text-green-400">-</span>WHAT
        </span>

        <div className="flex-1" />

        {/* 타이머 */}
        {phase === 'playing' && (
          <span className={`font-mono text-2xl font-bold tabular-nums transition-colors duration-500 ${timerColor} ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
            {mm}:{ss}
          </span>
        )}

        {/* 초성 */}
        {consonants && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20">
            <span className="text-xs text-[#7d8590] uppercase tracking-wider">초성</span>
            <span className="font-mono text-lg font-bold text-green-400 tracking-widest">{consonants}</span>
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={handleLogout}
          className="text-xs text-[#7d8590] hover:text-red-400 border border-[#21262d] hover:border-red-400/50 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          로그아웃
        </button>
      </header>

      {/* ── 메인 콘텐츠 ─────────────────────────────────── */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">

        {/* 플레이어 리스트 (20%) */}
        <div className="w-48 shrink-0">
          <PlayerList
            players={players}
            questionerId={questionerId}
            myUserId={MY_USER_ID}
            voteStatus={voteStatus}
            onVoteKick={handleVoteKick}
            hasVoted={hasVoted}
          />
        </div>

        {/* 캔버스 영역 (flex-1) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden glass rounded-xl">
          <div className="flex-1 relative overflow-hidden">
            <Canvas
              ref={canvasRef}
              isQuestioner={isQuestioner}
              currentColor={currentColor}
              onDraw={handleDraw}
            />

            {/* 대기 오버레이 */}
            {phase === 'waiting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c2128]/80 backdrop-blur-sm rounded-t-xl">
                <p className="font-mono text-lg font-bold text-[#7d8590]">참가자를 기다리는 중...</p>
                <p className="mt-2 text-sm text-[#484f58]">2명 이상 접속 시 게임 시작</p>
              </div>
            )}

            {/* 카운트다운 오버레이 */}
            {phase === 'countdown' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c2128]/80 backdrop-blur-sm rounded-t-xl">
                <span className="font-mono text-8xl font-bold text-green-400 animate-pop-in" key={countdown}>
                  {countdown}
                </span>
                <p className="mt-4 text-sm text-[#7d8590]">
                  출제자: <span className="text-[#e6edf3] font-semibold">{players.find(p => p.user_id === questionerId)?.nickname}</span>
                </p>
              </div>
            )}

            {/* 라운드 종료 오버레이 */}
            {phase === 'round_end' && roundResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c2128]/80 backdrop-blur-sm rounded-t-xl animate-pop-in">
                {roundResult.winner_id ? (
                  <>
                    <p className="text-green-400 text-2xl font-bold">🎉 정답!</p>
                    <p className="mt-2 text-lg text-[#e6edf3]">
                      <span className="text-green-400">{roundResult.winner_nickname}</span> 님 정답
                    </p>
                  </>
                ) : (
                  <p className="text-yellow-400 text-xl font-bold">⏰ 시간 초과</p>
                )}
                <p className="mt-3 font-mono text-3xl font-bold text-[#e6edf3]">{roundResult.word}</p>
                <p className="mt-1 text-sm text-[#7d8590]">
                  초성: <span className="font-mono text-green-400">{roundResult.consonants}</span>
                </p>
                <p className="mt-4 text-xs text-[#484f58]">잠시 후 다음 라운드가 시작됩니다...</p>
              </div>
            )}
          </div>

          {/* 툴바 (출제자 전용) */}
          {isQuestioner && phase === 'playing' && (
            <Toolbar
              currentColor={currentColor}
              onColorChange={setCurrentColor}
              onClear={handleClear}
            />
          )}
        </div>

        {/* 채팅 패널 (25%) */}
        <div className="w-64 shrink-0">
          <ChatPanel messages={messages} onSend={sendChat} />
        </div>
      </div>
    </div>
  )
}
