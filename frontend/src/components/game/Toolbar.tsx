import { ERASER_COLOR, PEN_COLORS } from '../../types/game'

interface Props {
  currentColor: string
  onColorChange: (color: string) => void
  onClear: () => void
}

export default function Toolbar({ currentColor, onColorChange, onClear }: Props) {
  const isEraser = currentColor === ERASER_COLOR

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#0d1117] border-t border-[#21262d]">
      {/* 펜 색상 버튼 */}
      <div className="flex items-center gap-1.5">
        {PEN_COLORS.map(({ hex, label }) => (
          <button
            key={hex}
            title={label}
            onClick={() => onColorChange(hex)}
            className="relative w-7 h-7 rounded-full border-2 transition-all duration-150 hover:scale-110"
            style={{
              backgroundColor: hex,
              borderColor: currentColor === hex ? '#4ade80' : '#21262d',
              boxShadow: currentColor === hex ? `0 0 8px ${hex}80` : 'none',
            }}
          >
            {/* 검정 테두리를 가시적으로 */}
            {hex === '#000000' && (
              <span className="absolute inset-0 rounded-full border border-[#484f58]" />
            )}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-[#21262d]" />

      {/* 지우개 */}
      <button
        title="지우개"
        onClick={() => onColorChange(ERASER_COLOR)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${
          isEraser
            ? 'bg-green-400/10 border-green-400/50 text-green-400'
            : 'border-[#21262d] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#484f58]'
        }`}
      >
        <EraserIcon />
        지우개
      </button>

      <div className="w-px h-5 bg-[#21262d]" />

      {/* 전체 지우기 */}
      <button
        title="전체 지우기"
        onClick={onClear}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-[#21262d] text-[#7d8590] hover:text-red-400 hover:border-red-400/50 transition-all duration-150"
      >
        <TrashIcon />
        전체 지우기
      </button>

      {/* 현재 색상 미리보기 */}
      <div className="ml-auto flex items-center gap-2 text-xs text-[#7d8590]">
        <span>{isEraser ? '지우개' : (PEN_COLORS.find(c => c.hex === currentColor)?.label ?? '')}</span>
        <div
          className="w-5 h-5 rounded-full border-2 border-[#21262d]"
          style={{ backgroundColor: isEraser ? '#4ade80' : currentColor }}
        />
      </div>
    </div>
  )
}

function EraserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H7L3 16l10-10 7 7-1.5 1.5" />
      <path d="M6.0001 10.0001 10 14" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}
