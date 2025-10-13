import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ToastProvider } from '../components/ui/Toast'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import BrowseCourses from '../pages/student/BrowseCourses'

vi.mock('../lib/apiClient', () => ({
  default: {
    get: vi.fn(async (url) => {
      if (url === '/api/student/courses') return { data: [{ id: 1, title: 'Math 101', teacher_name: 'Alice' }] }
      return { data: [] }
    }),
    post: vi.fn(),
  },
}))

describe('BrowseCourses', () => {
  it('renders course list', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <BrowseCourses />
        </ToastProvider>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText('Math 101')).toBeDefined())
  })
})
