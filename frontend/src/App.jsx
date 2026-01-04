import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './pages/auth/login'
import Header from './Components/header'
import Footer from './Components/footer'
import Signup from './pages/auth/signup'
import Home from './pages/Home'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Home />
      
    </>
  )
}

export default App
