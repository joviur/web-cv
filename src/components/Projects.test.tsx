import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Projects } from './Projects'
import { LanguageProvider } from '../context/LanguageContext'

describe('Projects', () => {
  it('no renderiza nada cuando no hay proyectos', () => {
    const { container } = render(
      <LanguageProvider>
        <Projects />
      </LanguageProvider>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
