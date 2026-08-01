import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { LanguageProvider } from './context/LanguageContext'

describe('App', () => {
  it('renderiza el nombre y las secciones principales', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'José María Vizcaíno' }),
    ).toBeInTheDocument()
    // Jerarquía: h1 → h2 por sección (sin saltos)
    expect(
      screen.getByRole('heading', { level: 2, name: /## 01 · Experiencia/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /## 02 · Habilidades/ }),
    ).toBeInTheDocument()
    expect(document.getElementById('experiencia')).toBeInTheDocument()
    expect(document.getElementById('skills')).toBeInTheDocument()
    expect(document.getElementById('educacion')).toBeInTheDocument()
    expect(document.getElementById('contacto')).toBeInTheDocument()
  })
})
