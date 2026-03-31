import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import AuthLayout from '../../components/common/AuthLayout'

// ── 1단계: 본인 확인 ──────────────────────────────────────
interface VerifyForm {
  email: string
  nickname: string
}
interface VerifyErrors {
  email?: string
  nickname?: string
}

function validateVerify(form: VerifyForm): VerifyErrors {
  const errors: VerifyErrors = {}
  if (!form.email) errors.email = '이메일을 입력해주세요.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '올바른 이메일 형식이 아닙니다.'
  if (!form.nickname) errors.nickname = '닉네임을 입력해주세요.'
  return errors
}

// ── 2단계: 새 비밀번호 ────────────────────────────────────
interface ResetForm {
  new_password: string
  new_password_confirm: string
}
interface ResetErrors {
  new_password?: string
  new_password_confirm?: string
}

function validateReset(form: ResetForm): ResetErrors {
  const errors: ResetErrors = {}
  if (!form.new_password) errors.new_password = '비밀번호를 입력해주세요.'
  else if (form.new_password.length < 8) errors.new_password = '비밀번호는 8자 이상이어야 합니다.'
  if (!form.new_password_confirm) errors.new_password_confirm = '비밀번호 확인을 입력해주세요.'
  else if (form.new_password_confirm !== form.new_password) errors.new_password_confirm = '비밀번호가 일치하지 않습니다.'
  return errors
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function PasswordResetPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2>(1)
  const [verifiedInfo, setVerifiedInfo] = useState<VerifyForm>({ email: '', nickname: '' })

  // 1단계
  const [verifyForm, setVerifyForm] = useState<VerifyForm>({ email: '', nickname: '' })
  const [verifyErrors, setVerifyErrors] = useState<VerifyErrors>({})
  const [verifyServerError, setVerifyServerError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)

  // 2단계
  const [resetForm, setResetForm] = useState<ResetForm>({ new_password: '', new_password_confirm: '' })
  const [resetErrors, setResetErrors] = useState<ResetErrors>({})
  const [resetServerError, setResetServerError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  // ── 1단계 핸들러 ──
  function handleVerifyChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setVerifyForm((prev) => ({ ...prev, [name]: value }))
    if (verifyErrors[name as keyof VerifyErrors]) setVerifyErrors((prev) => ({ ...prev, [name]: undefined }))
    setVerifyServerError('')
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validateVerify(verifyForm)
    if (Object.keys(errors).length > 0) { setVerifyErrors(errors); return }

    setVerifyLoading(true)
    setVerifyServerError('')
    try {
      await authApi.verifyIdentity(verifyForm.email, verifyForm.nickname)
      setVerifiedInfo(verifyForm)
      setStep(2)
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } }).response?.status
      if (status === 404) setVerifyServerError('이메일 또는 닉네임이 올바르지 않습니다.')
      else setVerifyServerError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setVerifyLoading(false)
    }
  }

  // ── 2단계 핸들러 ──
  function handleResetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setResetForm((prev) => ({ ...prev, [name]: value }))
    if (resetErrors[name as keyof ResetErrors]) setResetErrors((prev) => ({ ...prev, [name]: undefined }))
    setResetServerError('')
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validateReset(resetForm)
    if (Object.keys(errors).length > 0) { setResetErrors(errors); return }

    setResetLoading(true)
    setResetServerError('')
    try {
      await authApi.resetPassword(
        verifiedInfo.email,
        verifiedInfo.nickname,
        resetForm.new_password,
        resetForm.new_password_confirm,
      )
      navigate('/login', { replace: true })
    } catch {
      setResetServerError('비밀번호 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setResetLoading(false)
    }
  }

  // 공통 input 클래스
  function inputClass(hasError: boolean) {
    return `w-full px-4 py-2.5 rounded-lg bg-[#161b22] border text-sm text-[#e6edf3] placeholder-[#484f58] transition-all duration-200 focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)] ${
      hasError ? 'border-red-400/60 focus:border-red-400/60' : 'border-[#21262d] focus:border-green-400/50'
    }`
  }

  return (
    <AuthLayout>
      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-colors duration-300 ${step >= 1 ? 'bg-green-400 text-black' : 'bg-[#21262d] text-[#7d8590]'}`}>1</div>
        <div className={`flex-1 h-px transition-colors duration-300 ${step >= 2 ? 'bg-green-400/50' : 'bg-[#21262d]'}`} />
        <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-colors duration-300 ${step >= 2 ? 'bg-green-400 text-black' : 'bg-[#21262d] text-[#7d8590]'}`}>2</div>
      </div>

      {step === 1 ? (
        /* ── 1단계: 본인 확인 ── */
        <div className="animate-pop-in">
          <h2 className="text-lg font-semibold text-[#e6edf3] mb-1">비밀번호 재설정</h2>
          <p className="text-xs text-[#7d8590] mb-6">가입 시 사용한 이메일과 닉네임을 입력하세요.</p>

          <form onSubmit={handleVerifySubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">이메일</label>
              <input
                type="email" name="email" value={verifyForm.email}
                onChange={handleVerifyChange} placeholder="you@example.com"
                className={inputClass(!!verifyErrors.email)}
              />
              {verifyErrors.email && <p className="mt-1 text-xs text-red-400 animate-slide-up">{verifyErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">닉네임</label>
              <input
                type="text" name="nickname" value={verifyForm.nickname}
                onChange={handleVerifyChange} placeholder="가입 시 사용한 닉네임"
                className={inputClass(!!verifyErrors.nickname)}
              />
              {verifyErrors.nickname && <p className="mt-1 text-xs text-red-400 animate-slide-up">{verifyErrors.nickname}</p>}
            </div>

            {verifyServerError && <p className="text-sm text-red-400 animate-slide-up">{verifyServerError}</p>}

            <button
              type="submit" disabled={verifyLoading}
              className="w-full mt-2 py-2.5 rounded-lg bg-green-400 hover:bg-green-300 text-black text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyLoading ? '확인 중...' : '본인 확인'}
            </button>
          </form>
        </div>
      ) : (
        /* ── 2단계: 새 비밀번호 입력 ── */
        <div className="animate-pop-in">
          <h2 className="text-lg font-semibold text-[#e6edf3] mb-1">새 비밀번호 설정</h2>
          <p className="text-xs text-[#7d8590] mb-6">
            <span className="text-green-400">{verifiedInfo.nickname}</span> 님의 새 비밀번호를 입력하세요.
          </p>

          <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">새 비밀번호</label>
              <input
                type="password" name="new_password" value={resetForm.new_password}
                onChange={handleResetChange} placeholder="8자 이상"
                className={inputClass(!!resetErrors.new_password)}
              />
              {resetErrors.new_password && <p className="mt-1 text-xs text-red-400 animate-slide-up">{resetErrors.new_password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">비밀번호 확인</label>
              <input
                type="password" name="new_password_confirm" value={resetForm.new_password_confirm}
                onChange={handleResetChange} placeholder="비밀번호 재입력"
                className={inputClass(!!resetErrors.new_password_confirm)}
              />
              {resetErrors.new_password_confirm && <p className="mt-1 text-xs text-red-400 animate-slide-up">{resetErrors.new_password_confirm}</p>}
            </div>

            {resetServerError && <p className="text-sm text-red-400 animate-slide-up">{resetServerError}</p>}

            <button
              type="submit" disabled={resetLoading}
              className="w-full mt-2 py-2.5 rounded-lg bg-green-400 hover:bg-green-300 text-black text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      )}

      {/* 하단 링크 */}
      <div className="mt-6 flex justify-center gap-4 text-xs text-[#7d8590]">
        <Link to="/login" className="hover:text-[#e6edf3] transition-colors duration-150">로그인</Link>
        <span className="text-[#484f58]">·</span>
        <Link to="/signup" className="hover:text-[#e6edf3] transition-colors duration-150">회원가입</Link>
      </div>
    </AuthLayout>
  )
}
