export function getUserIdFromToken(): number | null {
  const token = localStorage.getItem('access_token')
  if (!token) return null
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64))
    return parseInt(payload.sub, 10)
  } catch {
    return null
  }
}
