import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    institutional_name: "",
    province: { district: "" },
    website: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "district") {
      // update nested province
      setFormData({
        ...formData,
        province: { ...formData.province, district: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/institutional/signup",
        formData,
      );

      if (res.data.success) {
        localStorage.setItem(
          "institution",
          JSON.stringify(res.data.institution),
        );
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div>
      <h2>Institution Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="institutional_name"
          placeholder="Institution Name"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="district"
          placeholder="District"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="website"
          placeholder="Website"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
        <br />
        <br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
