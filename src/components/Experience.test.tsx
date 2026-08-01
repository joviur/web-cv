import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Experience } from './Experience'
import { LanguageProvider } from '../context/LanguageContext'

describe('Experience', () => {
  it('muestra las empresas en orden, con NTT DATA primero', () => {
    render(
      <LanguageProvider>
        <Experience />
      </LanguageProvider>,
    )

    const empresas = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)

    expect(empresas).toEqual([
      'NTT DATA',
      'Redarquia Digital',
      'Azaconsa S.L',
      'Ayuntamiento de Aspe',
    ])
    expect(screen.getByText('Actualidad')).toBeInTheDocument()
  })
})
