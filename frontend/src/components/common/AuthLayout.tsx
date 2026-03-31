interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-base bg-dot-grid bg-[size:24px_24px] flex items-center justify-center">
      <div className="w-full max-w-md px-4 animate-pop-in">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-2xl font-bold tracking-widest text-[#e6edf3]">
            THINK<span className="text-green-400">-</span>WHAT
          </h1>
          <p className="mt-1 text-xs text-[#7d8590] tracking-widest uppercase">
            초성 맞추기 드로잉 게임
          </p>
        </div>

        {/* 카드 */}
        <div className="glass rounded-xl border-t-2 border-t-green-400/60 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
