import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState<string>('Loading...')

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ message: string }>
      })
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Failed to reach backend'))
  }, [])

  return (
    <main>
      <h1>UrbanShyn</h1>
      <p data-testid="backend-message">{message}</p>
    </main>
  )
}

export default App
