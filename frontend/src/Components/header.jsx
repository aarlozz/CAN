import React from "react";
import CAN_logo from "../assets/images/logo/CAN_logo.png";
import icon1 from "..//assets/images/icons/icon1.png"
import { Link } from "react-router-dom";

function Header() {
  return (
    <>
      {/* HEADER */}
      
<header className="fixed top-0 left-0 w-full bg-white shadow-sm z-40 ">
      
      <div
        className="max-w-7xl mx-auto flex justify-between items-center"
      >
        <div className="shadow-md ring-2 ring-blue-400 ">
         <ul> <li>
          <img
            src={CAN_logo}
            alt="Logo"
            className="w-32 h-20 object-contain"
          />
          </li>
          </ul>
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
            <li> <Link to='/'><img src={icon1} alt="homeicon"  /> </Link></li>
            
          </ul>
        </nav>
      </div>
    </header>
    </>
  );
}

export default Header;
