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

  it('updates kettle stitch measurements when pair controls change', () => {
    render(<HoleGuide />)

    const [, patternSelect] = screen.getAllByRole('combobox')
    fireEvent.change(patternSelect, { target: { value: 'custom' } })
    fireEvent.change(patternSelect, { target: { value: 'kettle-stitch' } })

    expect(screen.getByText(/Hole 2: 5.55 cm from top/i)).toBeDefined()

    const pairCountSelect = screen.getAllByRole('combobox')[2]
    fireEvent.change(pairCountSelect, { target: { value: '3' } })

    expect(screen.getByText(/Hole 2: 5.15 cm from top/i)).toBeDefined()

    fireEvent.change(screen.getByDisplayValue('1.6'), { target: { value: '0.8' } })

    expect(screen.getByText(/Hole 2: 5.75 cm from top/i)).toBeDefined()
  })
})
