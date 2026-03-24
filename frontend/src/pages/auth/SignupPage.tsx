import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../hooks/useAuth'
import AuthLayout from '../../components/common/AuthLayout'

interface FormState {
  email: string
  nickname: string
  password: string
}

interface FieldErrors {
  email?: string
  nickname?: string
  password?: string
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.email) errors.email = '이메일을 입력해주세요.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '올바른 이메일 형식이 아닙니다.'
  if (!form.nickname) errors.nickname = '닉네임을 입력해주세요.'
  else if (form.nickname.length < 4 || form.nickname.length > 20) errors.nickname = '닉네임은 4~20자 사이여야 합니다.'
  if (!form.password) errors.password = '비밀번호를 입력해주세요.'
  else if (form.password.length < 8) errors.password = '비밀번호는 8자 이상이어야 합니다.'
  return errors
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { saveTokens } = useAuth()

  const [form, setForm] = useState<FormState>({ email: '', nickname: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    setServerError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validate(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    setServerError('')
    try {
      const res = await authApi.signup(form.email, form.password, form.nickname)
      saveTokens(res.data.access_token, res.data.refresh_token)
      navigate('/game', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status: number; data?: { detail: string } } }).response?.status
      const detail = (err as { response?: { data?: { detail: string } } }).response?.data?.detail
      if (status === 409) setServerError(detail ?? '이미 사용 중인 정보입니다.')
      else setServerError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-6">회원가입</h2>

      {/* 중요 안내 */}
      <div className="mb-6 p-3 rounded-lg bg-green-400/5 border border-green-400/20 text-xs text-green-400/80 leading-relaxed">
        이메일과 닉네임은 비밀번호 재설정에 사용됩니다.
        <br />
        반드시 메모해 두세요.
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* 이메일 */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">
            이메일
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-lg bg-[#161b22] border text-sm text-[#e6edf3] placeholder-[#484f58] transition-all duration-200 focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)] ${
              fieldErrors.email ? 'border-red-400/60 focus:border-red-400/60' : 'border-[#21262d] focus:border-green-400/50'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-400 animate-slide-up">{fieldErrors.email}</p>
          )}
        </div>

        {/* 닉네임 */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">
            닉네임
          </label>
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder="4~20자"
            className={`w-full px-4 py-2.5 rounded-lg bg-[#161b22] border text-sm text-[#e6edf3] placeholder-[#484f58] transition-all duration-200 focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)] ${
              fieldErrors.nickname ? 'border-red-400/60 focus:border-red-400/60' : 'border-[#21262d] focus:border-green-400/50'
            }`}
          />
          {fieldErrors.nickname && (
            <p className="mt-1 text-xs text-red-400 animate-slide-up">{fieldErrors.nickname}</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#7d8590] mb-1.5">
            비밀번호
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="8자 이상"
            className={`w-full px-4 py-2.5 rounded-lg bg-[#161b22] border text-sm text-[#e6edf3] placeholder-[#484f58] transition-all duration-200 focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,222,128,0.08)] ${
              fieldErrors.password ? 'border-red-400/60 focus:border-red-400/60' : 'border-[#21262d] focus:border-green-400/50'
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-400 animate-slide-up">{fieldErrors.password}</p>
          )}
        </div>

        {/* 서버 오류 */}
        {serverError && (
          <p className="text-sm text-red-400 animate-slide-up">{serverError}</p>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 rounded-lg bg-green-400 hover:bg-green-300 text-black text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '처리 중...' : '회원가입'}
        </button>
      </form>

      {/* 하단 링크 */}
      <div className="mt-6 flex justify-center gap-4 text-xs text-[#7d8590]">
        <Link to="/login" className="hover:text-[#e6edf3] transition-colors duration-150">
          로그인
        </Link>
        <span className="text-[#484f58]">·</span>
        <Link to="/password-reset" className="hover:text-[#e6edf3] transition-colors duration-150">
          비밀번호 재설정
        </Link>
      </div>
    </AuthLayout>
  )
}
