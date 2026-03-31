import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../hooks/useAuth'
import AuthLayout from '../../components/common/AuthLayout'

interface FormState {
  email: string
  password: string
}

interface FieldErrors {
  email?: string
  password?: string
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.email) errors.email = '이메일을 입력해주세요.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = '올바른 이메일 형식이 아닙니다.'
  if (!form.password) errors.password = '비밀번호를 입력해주세요.'
  return errors
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { saveTokens } = useAuth()

  const [form, setForm] = useState<FormState>({ email: '', password: '' })
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
      const res = await authApi.login(form.email, form.password)
      saveTokens(res.data.access_token, res.data.refresh_token)
      navigate('/game', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } }).response?.status
      if (status === 401) setServerError('이메일 또는 비밀번호가 올바르지 않습니다.')
      else setServerError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-6">로그인</h2>

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
            placeholder="비밀번호 입력"
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
          {isLoading ? '처리 중...' : '로그인'}
        </button>
      </form>

      {/* 하단 링크 */}
      <div className="mt-6 flex justify-center gap-4 text-xs text-[#7d8590]">
        <Link to="/signup" className="hover:text-[#e6edf3] transition-colors duration-150">
          회원가입
        </Link>
        <span className="text-[#484f58]">·</span>
        <Link to="/password-reset" className="hover:text-[#e6edf3] transition-colors duration-150">
          비밀번호 재설정
        </Link>
      </div>
    </AuthLayout>
  )
}
