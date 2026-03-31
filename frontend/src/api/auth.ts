import apiClient from './client'
import type { TokenResponse } from '../types/auth'

export const authApi = {
  signup: (email: string, password: string, nickname: string) =>
    apiClient.post<TokenResponse>('/auth/signup', { email, password, nickname }),

  login: (email: string, password: string) =>
    apiClient.post<TokenResponse>('/auth/login', { email, password }),

  verifyIdentity: (email: string, nickname: string) =>
    apiClient.post<{ detail: string }>('/auth/password-reset/verify', { email, nickname }),

  resetPassword: (email: string, nickname: string, new_password: string, new_password_confirm: string) =>
    apiClient.post<{ detail: string }>('/auth/password-reset/confirm', {
      email,
      nickname,
      new_password,
      new_password_confirm,
    }),
}
