import './App.css'
import StudyInputBoard from './components/StudyInputBoard'
import RevisionList from './components/RevisionList'
import { useState, useEffect } from 'react'

function SignInScreen({ onSignIn }: { onSignIn: (user: { name: string; email: string }) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && email.trim()) {
      const user = { name: name.trim(), email: email.trim() }
      localStorage.setItem('revise_user', JSON.stringify(user))
      onSignIn(user)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#e0e7ff] via-[#f0fdfa] to-[#f5d0fe]">
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-2xl shadow-lg p-8 border w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Sign In</h2>
        <input
          className="border rounded px-3 py-2"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Your Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2" type="submit">
          Sign In
        </button>
      </form>
    </div>
  )
}

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('revise_user')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.name && parsed.email) {
          setUser(parsed)
        }
      } catch {}
    }
  }, [])

  if (!user) {
    return <SignInScreen onSignIn={setUser} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-[#e0e7ff] via-[#f0fdfa] to-[#f5d0fe]">
      <header className="w-full py-6 px-4 bg-white/80 shadow-md flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">
          📚 Revise: Spaced Repetition To-Do
        </h1>
        <span className="hidden md:inline text-gray-400 font-medium">Rule 1-2-4-7 Revision</span>
      </header>
      <main className="flex flex-1 flex-col md:flex-row gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <section className="flex-1 bg-white/90 rounded-2xl shadow-lg p-6 border border-blue-100 flex flex-col">
          <StudyInputBoard user={user} />
        </section>
        <section className="flex-1 bg-white/90 rounded-2xl shadow-lg p-6 border border-purple-100 flex flex-col">
          <RevisionList user={user} />
        </section>
      </main>
      <footer className="text-center text-xs text-gray-400 py-4">
        &copy; {new Date().getFullYear()} Revise. Made for personal productivity.
      </footer>
    </div>
  )
}

export default App
