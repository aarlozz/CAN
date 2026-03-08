import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function InstitutionSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institutionName: "",
    institutionType: "",
    establishedYear: "",
    website: "",
    description: "",
    location: {
      province: "",
      district: "",
      municipality: "",
      ward: "",
      street: "",
    },
    contactPerson: {
      name: "",
      phone: "",
      email: "",
      designation: "",
    },
  });
  //tesma vako contactPerson ko data lai map gareko same nahos vanera
  const contactPersonMap = {
    contactName: "name",
    contactPhone: "phone",
    contactEmail: "email",
    contactDesignation: "designation",
  };

  // now hamle mathi nested lai pani data rakhem aanni contactPerson ko field lai pani map garem

  const handleChange = (e) => {
    //mathi deko tareht field ko name ra tesma haleko value leko
    const { name, value } = e.target;
    // data ma yo naem haru xa vane
    if (
      ["province", "district", "municipality", "ward", "street"].includes(name)
    ) {
      setFormData({
        ...formData,
        location: { ...formData.location, [name]: value },
      });
    } else if (contactPersonMap[name]) {
      setFormData({
        ...formData,
        contactPerson: {
          ...formData.contactPerson,
          [contactPersonMap[name]]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/auth/signup-institution",
        formData,
      );
      alert("Institution regsitsered successfully");
      navigate("/login-institution");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Institution Signup</h2>

      <input
        name="name"
        placeholder="Owner Name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />

      <input
        name="institutionName"
        placeholder="Institution Name"
        value={formData.institutionName}
        onChange={handleChange}
      />

      <select
        name="institutionType"
        value={formData.institutionType}
        onChange={handleChange}
      >
        <option value="">Select Type</option>
        <option value="School">School</option>
        <option value="College">College</option>
        <option value="University">University</option>
      </select>

      <input
        name="establishedYear"
        type="number"
        placeholder="Established Year"
        value={formData.establishedYear}
        onChange={handleChange}
      />
      <input
        name="website"
        placeholder="Website"
        value={formData.website}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />

      <h4>Location</h4>
      <input
        name="province"
        placeholder="Province"
        value={formData.location.province}
        onChange={handleChange}
      />
      <input
        name="district"
        placeholder="District"
        value={formData.location.district}
        onChange={handleChange}
      />
      <input
        name="municipality"
        placeholder="Municipality"
        value={formData.location.municipality}
        onChange={handleChange}
      />
      <input
        name="ward"
        placeholder="Ward"
        value={formData.location.ward}
        onChange={handleChange}
      />
      <input
        name="street"
        placeholder="Street"
        value={formData.location.street}
        onChange={handleChange}
      />

      <h4>Contact Person</h4>
      <input
        name="contactName"
        placeholder="Contact Name"
        value={formData.contactPerson.name}
        onChange={handleChange}
      />
      <input
        name="contactPhone"
        placeholder="Contact Phone"
        value={formData.contactPerson.phone}
        onChange={handleChange}
      />
      <input
        name="contactEmail"
        placeholder="Contact Email"
        value={formData.contactPerson.email}
        onChange={handleChange}
      />
      <input
        name="contactDesignation"
        placeholder="Designation"
        value={formData.contactPerson.designation}
        onChange={handleChange}
      />

      <button type="submit">Register</button>
    </form>
  );
}
