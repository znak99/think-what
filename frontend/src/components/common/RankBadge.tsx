import type { RankLevel } from '../../types/game'

export function getRankLevel(points: number): RankLevel {
  if (points >= 40000) return 6
  if (points >= 15000) return 5
  if (points >= 6000) return 4
  if (points >= 2000) return 3
  if (points >= 500) return 2
  return 1
}

const RANK_CONFIG: Record<RankLevel, { color: string; glow: string; label: string }> = {
  1: { color: '#374151', glow: 'none', label: '검은색' },
  2: { color: '#92400e', glow: '0 0 6px #92400e', label: '갈색' },
  3: { color: '#94a3b8', glow: '0 0 6px #94a3b8', label: '은색' },
  4: { color: '#fbbf24', glow: '0 0 10px #fbbf24', label: '금색' },
  5: { color: '#34d399', glow: '0 0 14px #34d399', label: '에메랄드' },
  6: { color: 'url(#rainbow)', glow: 'none', label: '무지개' },
}

interface Props {
  points: number
  size?: number
}

export default function RankBadge({ points, size = 14 }: Props) {
  const level = getRankLevel(points)
  const config = RANK_CONFIG[level]
  const isRainbow = level === 6

  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0"
      title={`${config.label} (${points.toLocaleString()}pt)`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 14 14"
        className={isRainbow ? 'animate-rainbow' : ''}
        style={{ filter: config.glow !== 'none' ? `drop-shadow(${config.glow})` : undefined }}
      >
        {isRainbow && (
          <defs>
            <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#f87171" />
              <stop offset="25%"  stopColor="#fbbf24" />
              <stop offset="50%"  stopColor="#4ade80" />
              <stop offset="75%"  stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        )}
        {/* 다이아몬드 모양 (45도 회전 사각형) */}
        <rect
          x="2" y="2" width="10" height="10"
          rx="1"
          transform="rotate(45 7 7)"
          fill={isRainbow ? 'url(#rainbow)' : config.color}
        />
      </svg>
    </span>
  )
}
