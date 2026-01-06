import React from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header";
import Footer from "../../Components/footer";
import image15 from "../../assets/images/image/image15.png";

function Login() {
  return (
    <>
      {/* HEADER */}

      <Header />

      <main className="min-h-screen pt-24 flex justify-center items-start px-4 sm:px-6 md:px-8 lg:px-0">
        <section
          className="relative flex flex-col items-center justify-center bg-cover bg-center rounded-3xl w-full max-h-3xl max-w-4xl md:max-w-5xl lg:max-w-6xl overflow-hidden"
          style={{
            backgroundImage: `url(${image15})`,
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/50"></div>

          {/* Heading */}
          <p className="text-3xl sm:text-4xl text-center font-semibold z-10 mt-8 sm:mt-10 px-2 sm:px-4">
            Login to your account
          </p>

          {/* Form Container */}
          <div className="bg-red-400/55 w-full gap-y-6rem sm:w-[90%] md:w-[80%] lg:w-[70%] flex flex-col h-auto sm:h-40rem items-center rounded-3xl sm:rounded-4xl px-4 sm:px-6 md:px-8 py-6 mt-6 sm:mt-2">
            <div className="relative w-full flex flex-col z-10 gap-4 sm:gap-6 gap-y-5rem">
              {/* Welcome Text */}
              <p className="text-2xl sm:text-3xl font-semibold text-center mt-6 sm:mt-12 px-2 sm:px-0">
                Welcome Back
              </p>

              {/* EMAIL */}
              <div className="flex flex-col w-full px-2 sm:px-0">
                <label
                  htmlFor="email"
                  className="ml-2 sm:ml-4 text-sm sm:text-base text-left"
                >
                  Enter your Email:
                </label>
                <input
                  className="border-white bg-slate-50 border-2 rounded-3xl w-full sm:w-full md:w-[90%] lg:w-[90%] h-4 sm:h-16 mt-2 sm:mt-1 px-3 sm:px-4"
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col w-full px-2 sm:px-0">
                <label
                  htmlFor="password"
                  className="ml-2 sm:ml-4 text-sm sm:text-base text-left"
                >
                  Enter your password:
                </label>
                <input
                  className="border-white bg-slate-50 border-2 rounded-3xl w-full sm:w-[90%] md:w-[90%] lg:w-[90%] h-14 sm:h-14.7 mt-2 sm:mt-1 px-3 sm:px-4"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                />
              </div>

              {/* LOGIN TYPE */}
              <div className="px-2 flex flex-col sm:px-0">
                <label
                  htmlFor="login_type"
                  className="ml-2 sm:ml-4 text-sm sm:text-base text-left"
                >
                  Select login type
                </label>
                <select
                  name="login-type"
                  id="login-type"
                  className="bg-white w-full sm:w-[50%] md:w-[40%] lg:w-[35%] h-16 sm:h-16 rounded-lg  px-3 text-left ml-2"
                  defaultValue=""
                >
                  <option value="" disabled hidden selected>
                    Choose login
                  </option>
                  <option value="student">Student</option>
                  <option value="college">College</option>
                </select>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-6 sm:mt-20 gap-3 sm:gap-4 w-full px-2 sm:px-0">
                <button className="bg-red-400 border-black text-white w-full sm:w-44 h-12.25 border-2 rounded-3xl p-1">
                  Login
                </button>

                <button className="border-black text-black w-full sm:w-44 h-12.25 border-2 rounded-3xl p-1">
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Login;
