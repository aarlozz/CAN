import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../../Components/header'
import Footer from '../../Components/footer'
import image15 from '../../assets/images/image/image15.png';


function Login() {
  return (
    <>
      {/* HEADER
      <header className="fixed w-full bg-white shadow-sm z-40 top-0">
        <div className="max-w-[1450px] max-h-[101px] mx-auto flex items-center justify-between px-12 py-6">
          <div className="shadow-md ring-2 ring-blue-400 ml-20">
            <img
              src="assets/images/canlogo.png"
              alt="Logo"
              className="w-[177px] h-[87px] object-contain"
            />
          </div>

          <nav>
            <ul className="flex text-xl text-gray-800 font-sans font-semibold gap-5 items-center mr-10">
              <li className="hover:text-red-500 cursor-pointer">Services</li>
              <li className="hover:text-red-500 cursor-pointer">About</li>
              <li className="hover:text-red-500 cursor-pointer">Partner</li>
              <li className="hover:text-red-500 cursor-pointer">SignUp</li>
              <li className="hover:text-red-500 cursor-pointer">Login</li>
              <img
                src="assets/icons/icon1.png"
                alt="homeicon"
                className="mx-20"
              />
            </ul>
          </nav>
        </div>
        
      </header> */}
      
      <Header />


      {/* MAIN */}
      <main className="h-full mt-[150px]">
        <section
          className="relative flex flex-col items-center justify-center bg-cover bg-center rounded-3xl mx-[60px] overflow-hidden"
          style={{
            backgroundImage: `url(${image15})`,
          }}
        >
          <div className="absolute inset-0 bg-white/40"></div>

          <p className="text-4xl text-center font-semibold z-10 mt-10">
            Login to your account
          </p>

          <div className="bg-red-400/55 w-[716px] flex flex-col h-[650px] items-center rounded-4xl px-4 py-4 p-10 mt-2">
            <div className="relative w-full h-full flex flex-col z-10 gap-6">
              <p className="text-3xl font-semibold text-left mt-12">
                Welcome Back
              </p>

              {/* EMAIL */}
              <div className="flex flex-col w-full">
                <label  htmlFor="email">
                  Enter your Email:
                </label>
                <input
                  className="border-white bg-slate-50 border-2 rounded-3xl w-36rem h-4rem ml-4 p-2"
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col w-full">
                <label className="ml-4" htmlFor="password">
                  Enter your password:
                </label>
                <input
                  className="border-white bg-slate-50 border-2 rounded-3xl w-[605px] h-[59px] ml-4 p-2"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                />
              </div>

              {/* LOGIN TYPE */}
              <div>
                <select
                  name="login-type"
                  id="login-type"
                  className="bg-white w-[308px] h-[60px] rounded-lg ml-4 mt-4"
                >
                  <option value=""hidden selected disabled>Select login type</option>
                  <option value="student">Student</option>
                  <option value="college">College</option>
                </select>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end mt-20 gap-3">
                <button className="bg-red-400 border-black text-white w-[176px] h-[49px] border-2 rounded-3xl p-1">
                  Login
                </button>

                <button className="border-black text-black w-[176px] h-[49px] border-2 rounded-3xl p-1">
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default Login
