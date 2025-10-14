import { useState } from 'react'
import GetTicket from './components/GetTicket'
import './App.css'

function App() {
  return (
  <div className="app">
      <header>
        <h1>Office Queue Management</h1>
      </header>
      <main>
        <GetTicket />
      </main>
      <footer>
        <p>© 2025 Office Queue Management. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
