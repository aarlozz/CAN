import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function InstitutionLogin() {
  const navigate = useNavigate();

  const [formData, setformData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setformData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await axios.post("http://localhost:5000/api/auth/login-institution", formData);

      //stroe JWT token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

if(res.data.role ==="institution"){
  navigate("/dashboard-institution")
}
   
    
         alert("Logged in successfully")
    } catch (error){
        alert (error.response?.data?.message || "Login failed")
    }
  };


 return (
    <form onSubmit={handleSubmit}>
      <h2>Institution Login</h2>

      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />

      <button type="submit">Login</button>
    </form>
  );
}




















