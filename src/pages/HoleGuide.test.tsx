import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HoleGuide from './HoleGuide'

describe('HoleGuide', () => {
  it('applies the optional ribbon gap to custom patterns', () => {
    render(<HoleGuide />)

    const [, patternSelect] = screen.getAllByRole('combobox')
    fireEvent.change(patternSelect, { target: { value: 'custom' } })

    expect(document.body.contains(screen.getByPlaceholderText('Optional'))).toBe(true)
    expect(document.body.contains(screen.getByText(/Hole 2: 6.25 cm from top/i))).toBe(true)

    fireEvent.change(screen.getByPlaceholderText('Optional'), { target: { value: '1.2' } })

    expect(document.body.contains(screen.getByText(/Hole 2: 7.27 cm from top/i))).toBe(true)
  })

  it('updates kettle stitch measurements when pair controls change', () => {
    render(<HoleGuide />)

    const [, patternSelect] = screen.getAllByRole('combobox')
    fireEvent.change(patternSelect, { target: { value: 'custom' } })
    fireEvent.change(patternSelect, { target: { value: 'kettle-stitch' } })

    expect(document.body.contains(screen.getByText(/Hole 2: 5.55 cm from top/i))).toBe(true)

    const pairCountSelect = screen.getAllByRole('combobox')[2]
    fireEvent.change(pairCountSelect, { target: { value: '3' } })

    expect(document.body.contains(screen.getByText(/Hole 2: 5.15 cm from top/i))).toBe(true)

    fireEvent.change(screen.getByDisplayValue('1.6'), { target: { value: '0.8' } })

    expect(document.body.contains(screen.getByText(/Hole 2: 5.75 cm from top/i))).toBe(true)
  })
})
