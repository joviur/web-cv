import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Experience } from './components/Experience'
import { Skills } from './components/Skills'
import { Education } from './components/Education'
import { Projects } from './components/Projects'
import { Footer } from './components/Footer'
import { useDarkMode } from './hooks/useDarkMode'

export default function App() {
  const [dark, toggleDark] = useDarkMode()

  return (
    <div className="min-h-screen bg-base font-mono text-ink transition-colors">
      <Navbar dark={dark} onToggleDark={toggleDark} />
      <main className="mx-auto max-w-[780px] px-6">
        <Hero />
        <Experience />
        <Skills />
        <Education />
        <Projects />
      </main>
      <Footer />
    </div>
  )
}
