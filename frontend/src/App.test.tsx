import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('displays the message from the backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Hello from backend' }),
      }),
    )

    render(<App />)

    await waitFor(() =>
      expect(screen.getByTestId('backend-message')).toHaveTextContent(
        'Hello from backend',
      ),
    )
  })
})
