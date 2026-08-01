import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Experience } from './components/Experience'
import { Skills } from './components/Skills'
import { Education } from './components/Education'
import { Projects } from './components/Projects'
import { Footer } from './components/Footer'
import { useDarkMode } from './hooks/useDarkMode'

export default function App() {
  const [dark, toggleDark] = useDarkMode()

  return (
    <div className="min-h-screen bg-white text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-200">
      <Navbar dark={dark} onToggleDark={toggleDark} />
      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Education />
        <Projects />
      </main>
      <Footer />
    </div>
  )
}
