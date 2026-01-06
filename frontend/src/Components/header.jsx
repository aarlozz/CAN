import React from "react";
import CAN_logo from "../assets/images/logo/CAN_logo.png";
import icon1 from "..//assets/images/icons/icon1.png"
import { Link } from "react-router-dom";

function Header() {
  return (
    <>
      {/* HEADER */}
      
<header className=" fixed top-0 left-0  bg-white shadow-sm z-40 ">
      
      <div
        className="container mx-auto flex items-center justify-between py-3 px-6"
      >
        <div className="shadow-md ring-2 ring-blue-400 ">
          <img
            src={CAN_logo}
            alt="Logo"
            className="w-35 h-20 object-contain"
          />
          
        </div>

        <nav>
          <ul
            className="flex text-xl text-gray-800 font-sans font-semibold gap-5 items-center "
          >
            <li className="hover:text-red-500">Services</li>
            <li className="hover:text-red-500">About</li>
            <li className="hover:text-red-500">Partner</li>
            <li className="hover:text-red-500"> <Link to="/signup">Signup </Link> </li>
            <li className="hover:text-red-500"> <Link to="/login" >Login </Link> </li>
            <img src={icon1} alt="homeicon"  />
          </ul>
        </nav>
      </div>
    </header>
    </>
  );
}

export default Header;
