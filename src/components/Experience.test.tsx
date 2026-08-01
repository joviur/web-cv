import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Experience } from './Experience'
import { LanguageProvider } from '../context/LanguageContext'

describe('Experience', () => {
  it('muestra los puestos en orden, con NTT DATA en la primera fila', () => {
    render(
      <LanguageProvider>
        <Experience />
      </LanguageProvider>,
    )

    const puestos = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)

    expect(puestos).toEqual([
      'Software Engineer ACTUAL',
      'Desarrollador RPA y Administrador de Sistemas',
      'Responsable de Informática y parte del equipo de compras',
      'Prácticas FCT — Ayudante de Administrador de Sistemas',
    ])
    expect(screen.getByText(/NTT DATA/)).toBeInTheDocument()
    expect(screen.getByText('ACTUAL')).toBeInTheDocument()
  })
})
