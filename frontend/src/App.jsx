import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './pages/auth/login'
import Header from './Components/header'
import Footer from './Components/footer'
import Signup from './pages/auth/signup'
import Home from './pages/Home'
import {Routes, Route} from 'react-router-dom'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Routes>
      
    </>
  )
}

export default App
