import React from "react";
import CAN_logo from "../assets/images/logo/CAN_logo.png";
import { Link } from "react-router-dom";

function Header() {
  return (
    <>
      {/* HEADER */}
      <header className="bg-white shadow-sm  top-0 mx-0">
        <div className="max-h-[101px] flex items-center justify-between px-12 py-6">
          <div>
            <img src={CAN_logo} alt="CAN_logo" className="h-10 " />
          </div>
          <div className="flex gap-10 font-bold ">
            <ul className="hover:text-gray-300 ">Services</ul>
            <ul className="hover:text-gray-300 ">About</ul>
            <ul className="hover:text-gray-300 ">Patner</ul>
            <ul className="hover:text-gray-300 "><Link to="/signup">Signup</Link></ul>
            <ul className="hover:text-gray-300 "><Link to="/login">Login</Link></ul>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
