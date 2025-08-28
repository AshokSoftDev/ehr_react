import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DemoForm from './pages/demo'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DemoForm />
    </>
  )
}

export default App
