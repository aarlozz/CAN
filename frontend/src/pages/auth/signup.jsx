import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student"); // default role
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",

    // Student fields
    personal_info: {
      dob: "",
      gender: "",
      phone: "",
    },
    address: {
      province: "",
      district: "",
      municipality: "",
      ward: "",
      street: "",
    },
    guardian_info: {
      name: "",
      relation: "",
      phone_number: "",
      occupation: "",
    },

    // Institution fields
    institutionName: "",
    institutionType: "",
    establishedYear: "",
    website: "",
    location: {
      province: "",
      district: "",
      municipality: "",
      ward: "",
      street: "",
    },
    description: "",
    contactPerson: {
      name: "",
      phone: "",
      email: "",
      designation: "",
    },
  });

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setForm({
        ...form,
        [section]: {
          ...form[section],
          [name]: value,
        },
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // prepare payload based on role
    let payload = { ...form, role };
    if (role === "student") {
      // only include student-related fields
      payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        personal_info: form.personal_info,
        address: form.address,
        guardian_info: form.guardian_info,
      };
    } else {
      // institution fields
      payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        institutionName: form.institutionName,
        institutionType: form.institutionType,
        establishedYear: form.establishedYear,
        website: form.website,
        location: form.location,
        description: form.description,
        contactPerson: form.contactPerson,
      };
    }

    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      // save JWT token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`);

      // redirect to dashboard
      navigate(role === "student" ? "/student/dashboard" : "/institution/dashboard");
    } else {
      alert(data.message || "Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>

      <label>
        Role:
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="institution">Institution</option>
        </select>
      </label>

      <form onSubmit={handleSubmit}>
        <h3>Basic Info</h3>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />

        {role === "student" && (
          <>
            <h3>Personal Info</h3>
            <input
              name="dob"
              type="date"
              placeholder="Date of Birth"
              onChange={(e) => handleChange(e, "personal_info")}
            />
            <select name="gender" onChange={(e) => handleChange(e, "personal_info")}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input name="phone" placeholder="Phone" onChange={(e) => handleChange(e, "personal_info")} />

            <h3>Address</h3>
            <input name="province" placeholder="Province" onChange={(e) => handleChange(e, "address")} />
            <input name="district" placeholder="District" onChange={(e) => handleChange(e, "address")} />
            <input name="municipality" placeholder="Municipality" onChange={(e) => handleChange(e, "address")} />
            <input name="ward" placeholder="Ward" onChange={(e) => handleChange(e, "address")} />
            <input name="street" placeholder="Street" onChange={(e) => handleChange(e, "address")} />

            <h3>Guardian Info</h3>
            <input name="name" placeholder="Guardian Name" onChange={(e) => handleChange(e, "guardian_info")} />
            <input name="relation" placeholder="Relation" onChange={(e) => handleChange(e, "guardian_info")} />
            <input name="phone_number" placeholder="Phone Number" onChange={(e) => handleChange(e, "guardian_info")} />
            <input name="occupation" placeholder="Occupation" onChange={(e) => handleChange(e, "guardian_info")} />
          </>
        )}

        {role === "institution" && (
          <>
            <h3>Institution Info</h3>
            <input name="institutionName" placeholder="Institution Name" onChange={handleChange} />
            <input name="institutionType" placeholder="Institution Type" onChange={handleChange} />
            <input name="establishedYear" placeholder="Established Year" onChange={handleChange} />
            <input name="website" placeholder="Website" onChange={handleChange} />

            <h3>Address</h3>
            <input name="province" placeholder="Province" onChange={(e) => handleChange(e, "location")} />
            <input name="district" placeholder="District" onChange={(e) => handleChange(e, "location")} />
            <input name="municipality" placeholder="Municipality" onChange={(e) => handleChange(e, "location")} />
            <input name="ward" placeholder="Ward" onChange={(e) => handleChange(e, "location")} />
            <input name="street" placeholder="Street" onChange={(e) => handleChange(e, "location")} />

            <h3>Contact Person</h3>
            <input name="name" placeholder="Name" onChange={(e) => handleChange(e, "contactPerson")} />
            <input name="phone" placeholder="Phone" onChange={(e) => handleChange(e, "contactPerson")} />
            <input name="email" placeholder="Email" onChange={(e) => handleChange(e, "contactPerson")} />
            <input name="designation" placeholder="Designation" onChange={(e) => handleChange(e, "contactPerson")} />
            <input name="description" placeholder="Description" onChange={handleChange} />
          </>
        )}

        <button type="submit">Signup</button>
      </form>
    </div>
  );
}