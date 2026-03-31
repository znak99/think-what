import RankBadge from '../common/RankBadge'
import type { PlayerInfo, VoteStatus } from '../../types/game'

interface Props {
  players: PlayerInfo[]
  questionerId: number | null
  myUserId: number | null
  voteStatus: VoteStatus | null
  onVoteKick: () => void
  hasVoted: boolean
}

export default function PlayerList({ players, questionerId, myUserId, voteStatus, onVoteKick, hasVoted }: Props) {
  const amQuestioner = myUserId === questionerId
  const canVote = !amQuestioner && questionerId !== null

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-[#21262d]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7d8590]">
          참가자 <span className="font-mono text-green-400">{players.length}</span>
        </p>
      </div>

      {/* 플레이어 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {players.length === 0 && (
          <p className="text-xs text-[#484f58] text-center mt-4">대기 중...</p>
        )}
        {players.map((p) => {
          const isQuestioner = p.user_id === questionerId
          const isMe = p.user_id === myUserId
          return (
            <div
              key={p.user_id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors duration-150 ${
                isQuestioner ? 'bg-green-400/8 border border-green-400/20' : 'hover:bg-white/5'
              }`}
            >
              <RankBadge points={p.rank_points} size={12} />
              <span className={`flex-1 truncate ${isMe ? 'text-green-400' : 'text-[#e6edf3]'}`}>
                {p.nickname}
                {isMe && <span className="ml-1 text-[10px] text-[#7d8590]">(나)</span>}
              </span>
              {isQuestioner && (
                <span className="text-[10px] font-mono text-green-400 shrink-0">출제자</span>
              )}
            </div>
          )
        })}
      </div>

      {/* 출제자 재배정 투표 */}
      {canVote && (
        <div className="px-3 py-3 border-t border-[#21262d] space-y-2">
          {voteStatus && (
            <div className="flex items-center justify-between text-xs text-[#7d8590] font-mono">
              <span>재배정 투표</span>
              <span className="text-green-400">{voteStatus.votes} / {voteStatus.required}</span>
            </div>
          )}
          <button
            onClick={onVoteKick}
            disabled={hasVoted}
            className="w-full py-1.5 text-xs font-semibold rounded-lg border border-[#21262d] text-[#7d8590] hover:border-red-400/50 hover:text-red-400 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {hasVoted ? '투표 완료' : '출제자 재배정 투표'}
          </button>
        </div>
      )}
    </div>
  )
}
