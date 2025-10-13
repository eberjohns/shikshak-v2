import { describe, it, expect, vi } from 'vitest'
import useAuthStore from '../store/authStore'

vi.mock('../lib/apiClient', () => ({
  default: {
    post: vi.fn(async (url, payload) => {
      if (url === '/api/auth/login') return { data: { token: 'abc', user: { id: 1, name: 'Test' } } }
      return { data: {} }
    }),
  },
}))

describe('authStore', () => {
  it('logs in successfully', async () => {
    const res = await useAuthStore.getState().login('a@b.com', 'pw')
    
    expect(res.success).toBe(true)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().token).toBe('abc')
  })
})
