import { useEffect, useState } from 'react'

const MIN_WIDTH = 1024
const MIN_HEIGHT = 600

export default function MinSizeGuard({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const tooSmall = size.w < MIN_WIDTH || size.h < MIN_HEIGHT

  useEffect(() => {
    function check() {
      setSize({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!tooSmall) return <>{children}</>

  return (
    <>
      {children}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070a12]/80 backdrop-blur-md">
        <div className="relative mx-4 max-w-sm w-full rounded-2xl border border-[#21262d] bg-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(74,222,128,0.08)] p-8 flex flex-col items-center gap-5 animate-pop-in">
          {/* 상단 컬러 바 */}
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div className="text-center space-y-2">
            <p className="font-mono font-bold text-lg text-[#e6edf3]">화면이 너무 작습니다</p>
            <p className="text-sm text-[#7d8590] leading-relaxed">
              게임을 원활하게 즐기려면<br />
              최소 <span className="font-mono text-yellow-400">{MIN_WIDTH} × {MIN_HEIGHT}</span> 이상의<br />
              화면 크기가 필요합니다.
            </p>
          </div>

          <div className="w-full rounded-lg bg-[#161b22] border border-[#21262d] px-4 py-3 flex items-center justify-between text-xs font-mono">
            <span className="text-[#7d8590]">현재 크기</span>
            <span className="text-yellow-400">
              {size.w} × {size.h}
            </span>
          </div>

          <p className="text-xs text-[#484f58] text-center">
            창 크기를 늘리면 자동으로 사라집니다.
          </p>
        </div>
      </div>
    </>
  )
}
