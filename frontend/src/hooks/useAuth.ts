export function useAuth() {
  const isLoggedIn = !!localStorage.getItem('access_token')

  function saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  function clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return { isLoggedIn, saveTokens, clearTokens }
}
