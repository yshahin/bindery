import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Routing', () => {
  it('renders home page by default', () => {
    render(<App />)
    expect(screen.getAllByText(/The Art of/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Bookbinding/i).length).toBeGreaterThan(0)
  })

  // We can't easily test navigation without userEvent or setup, but this verifies initial render
})
