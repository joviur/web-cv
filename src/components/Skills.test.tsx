import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Skills } from './Skills'
import { LanguageProvider } from '../context/LanguageContext'

const renderSkills = () =>
  render(
    <LanguageProvider>
      <Skills />
    </LanguageProvider>,
  )

describe('Skills', () => {
  it('filtra por categoría', async () => {
    const user = userEvent.setup()
    renderSkills()

    expect(screen.getByText('Python')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '[ sistemas ]' }))

    expect(screen.queryByText('Python')).not.toBeInTheDocument()
    expect(screen.getByText('Linux')).toBeInTheDocument()
    expect(screen.getByText('Windows Server')).toBeInTheDocument()
  })

  it('vuelve a mostrar todo con el filtro todos', async () => {
    const user = userEvent.setup()
    renderSkills()

    await user.click(screen.getByRole('button', { name: '[ desarrollo ]' }))
    expect(screen.queryByText('Linux')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '[ todos ]' }))
    expect(screen.getByText('Linux')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })
})
