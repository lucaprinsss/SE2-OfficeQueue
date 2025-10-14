import { useState } from 'react'
import './App.css'
import NextCustomer from './components/NextCustomer.jsx'
import SelectCounterID from './components/SelectCounterId.jsx'

function App() {
  const [counterID, setCounterID] = useState(0);
  return (
    <div className="app">
      <header>
        <h1>Office Queue Management</h1>
      </header>
      <main>
        {counterID === 0 ? <SelectCounterID setCounterID={setCounterID} /> : <NextCustomer counterID={counterID} />}
      </main>
      <footer>
        <p>© 2025 Office Queue Management. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
