import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignupPage from './pages/auth/SignupPage'
import LoginPage from './pages/auth/LoginPage'
import PasswordResetPage from './pages/auth/PasswordResetPage'
import GamePage from './pages/game/GamePage'
import { AuthGuard } from './components/common/AuthGuard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 인증 */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />

        {/* 게임 (로그인 필요) */}
        <Route
          path="/game"
          element={
            <AuthGuard>
              <GamePage />
            </AuthGuard>
          }
        />

        {/* 기본 진입 → 로그인으로 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
