import React from 'react'
import Header from '../../Components/header'
import Footer from '../../Components/footer'
import { Link } from 'react-router-dom'
import image15 from "../../assets/images/image/image15.png";

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
      <main className="h-full mt-37.5">
  <section
    className="relative flex flex-col items-center justify-center w-340 h-300 bg-cover bg-center rounded-3xl mx-auto overflow-hidden"
    style={{ backgroundImage: `url(${image15})` }}
  >
    <div className="absolute inset-0 bg-white/60"></div>

    <p className="text-4xl text-center font-semibold z-10 mt-10">
      Create your account
    </p>

    <div className="bg-red-400/55 w-200.75 flex flex-col h-280 items-center rounded-4xl px-4 py-4 p-10 mt-2">
      <div className="relative w-full h-full flex flex-col z-10 gap-6">
        <p className="text-2xl font-semibold text-left mt-12 mx-auto">
          Sign Up to start your scholarship journey
        </p>

        <div className="text-1xl font-semibold text-left flex mx-auto">
          <span>Student Signup / </span>
          <span className="text-red-700">Institution Signup</span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex flex-col gap-y-5 w-140 h-12"
        >
          {/* Institution Name */}
          <div className="flex flex-col ml-4 w-full h-18">
            <label htmlFor="institution_name"className='text-left'>Name of Institution</label>
            <input
              className="border-white bg-slate-50 border-2 rounded-sm w-full h-12 p-2"
              type="text"
              name="institution_name"
              id="institution_name"
              placeholder="Enter your institution name"
              onChange={handleChange}
              required
            />
          </div>

          {/* Province */}
          <div className="ml-4 w-109">
            <select
              name="province"
              id="province"
              className="bg-white w-full h-10 rounded-lg"
              defaultValue=""
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                Select Province
              </option>
              <option value="bagmati">Bagmati</option>
              <option value="koshi">Koshi</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* City & Street */}
          <div className="flex flex-col-2 gap-12 w-full">
            <div className="ml-4 w-46.5 h-17.5">
              <label htmlFor="city" className='text-left block '>City:</label>
              <input
                className="bg-slate-50 rounded-sm w-full h-10 p-2"
                type="text"
                name="city"
                id="city"
                placeholder="Example: Kathmandu"
                onChange={handleChange}
                required
              />
            </div>
            <div className="ml-4 w-46.5 h-">
              <label htmlFor="street_address" className='block text-left'>Street Address:</label>
              <input
                className="bg-slate-50 rounded-sm w-full h-10 p-2"
                type="text"
                name="street_address"
                id="street_address"
                placeholder="Example: Putalisadak"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Website */}
          <div className=" flex flex-col ml-4 w-140.5 h-17.5">
            <div>
            <label htmlFor="website" className='text-left block'>Institution Website link</label>
            <input
              className="rounded-sm border-white bg-slate-50 w-full h-10 p-2"
              type="url"
              name="website"
              id="website"
              placeholder="https://www.example.edu/"
              onChange={handleChange}
            />
            </div>
          </div>

          {/* Email */}
          <div className=" flex flex-col ml-4 w-140.5 h.17.5">
            <label htmlFor="email" className='text-left block'>E-mail</label>
            <input
              className="rounded-sm border-white bg-slate-50 w-full h-10 p-2"
              type="email"
              name="email"
              id="email"
              placeholder="Enter your e-mail"
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className=" flex flex-col ml-4 w-75">
            <label htmlFor="phone_number" className='block text-left'>Phone number:</label>
            <input
              className="rounded-sm border-white bg-slate-50 w-full h-10 p-2"
              type="tel"
              name="phone_number"
              id="phone_number"
              pattern="[0-9]{10}"
              maxLength={10}
              minLength={10}
              placeholder="Phone Number"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="ml-4 w-141.5 h-17.5">
            <label htmlFor="password" className='block text-left'>Password:</label>
            <input
              className="rounded-sm border-white bg-slate-50 w-full h-10 p-2"
              type="password"
              name="password"
              id="password"
              placeholder="**********"
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="ml-4 w-141.5 h-10">
            <label htmlFor="confirm_password" className='block text-left'>Confirm Password:</label>
            <input
              className="rounded-sm border-white bg-slate-50 w-full h-10 p-2"
              type="password"
              name="confirm_password"
              id="confirm_password"
              placeholder="**********"
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="w-150 h-26 mx-auto flex flex-col justify-center items-center gap-y-2">
            <button
              type="submit"
              className="w-89.5 h-11 rounded-3xl bg-red-500 text-white"
            >
              Create Account
            </button>
            <div className="w-125 mt-4 text-center">
              <p>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</main>


      <Footer />
    </>
  )
}

export default Signup
