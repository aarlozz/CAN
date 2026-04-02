import { useState } from "react";
import Header from "../../Components/header";
import Footer from "../../Components/footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CreateScholarship() {
  const [form, setForm] = useState({
    scholarshipTitle: "",
    scholarshipType: "",
    scholarshipAmountNpr: "",
    scholarshipPercentage: "",
    totalSeats: "",
    deadline: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      scholarshipTitle: form.scholarshipTitle,
      totalSeats: Number(form.totalSeats),
      deadline: form.deadline,
      description: form.description,
      coverage: {
        scholarshipType: form.scholarshipType,
        scholarshipAmountNpr: form.scholarshipAmountNpr || null,
        scholarshipPercentage: form.scholarshipPercentage || null,
      },
    };

    try {
      const res = await fetch(`${API}/api/scholarship/addscholarship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Scholarship created successfully");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Create Scholarship</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="scholarshipTitle"
            placeholder="Scholarship Title"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <select
            name="scholarshipType"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Type</option>
            <option value="Full">Full</option>
            <option value="Partial">Partial</option>
          </select>

          <input
            name="scholarshipAmountNpr"
            placeholder="Amount (NPR)"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="scholarshipPercentage"
            placeholder="Percentage (%)"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="totalSeats"
            type="number"
            placeholder="Total Seats"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            name="deadline"
            type="date"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <button className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
            Create
          </button>
        </form>

        {message && <p className="mt-4 text-sm">{message}</p>}
      </main>
      <Footer />
    </>
  );
}