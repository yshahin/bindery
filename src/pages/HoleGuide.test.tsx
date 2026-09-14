import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HoleGuide from './HoleGuide'

describe('HoleGuide', () => {
  it('applies the optional ribbon gap to custom patterns', () => {
    render(<HoleGuide />)

    const [, patternSelect] = screen.getAllByRole('combobox')
    fireEvent.change(patternSelect, { target: { value: 'custom' } })

    expect(screen.getByPlaceholderText('Optional')).toBeDefined()
    expect(screen.getByText(/Hole 2: 6.25 cm from top/i)).toBeDefined()

    fireEvent.change(screen.getByPlaceholderText('Optional'), { target: { value: '1.2' } })

    expect(screen.getByText(/Hole 2: 7.27 cm from top/i)).toBeDefined()
  })
})
