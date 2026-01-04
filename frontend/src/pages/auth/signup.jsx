import React from 'react'
import Header from '../../Components/header'
import Footer from '../../Components/footer'
import { Link } from 'react-router-dom'

function Signup() {
  const [form, setform] = React.useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  }

  return (

    <>
      <Header />
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-md bg-[#f0b7ba]">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign up to start your scholarship Journey.</h2>
        <samp>First Name</samp>
        <input type="text" name='fname' placeholder='First Name' onChange={handleChange} required className='w-full border p-2 mb-3' />
        <samp>last Name</samp>
        <input type="text" name='lname' placeholder='Last Name' onChange={handleChange} required className='w-full border p-2 mb-3' />
        <samp>Email</samp>
        <input type="email" name='email' placeholder='Email' onChange={handleChange} required className='w-full border p-2 mb-3' />
        <samp>Password</samp>
        <input type="password" name='password' placeholder='Password' onChange={handleChange} required className='w-full border p-2 mb-3' />
        
        <button className='bg-[#EE4248] py-3 px-5 rounded-3xl' > Create Account</button>
      </form>

      <Footer />
    </>
  )
}

export default Signup
