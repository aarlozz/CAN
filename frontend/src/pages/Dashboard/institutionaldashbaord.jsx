import { useEffect, useState } from "react";
import axios from "axios";

export default function InstitutionalDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/institution/dashboard-institution",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setData(res.data);
    };

    fetchData();
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>{data.institutionName}</h1>
      <p>Email: {data.user.email}</p>
      <p>Province: {data.location.province}</p>
      <p>District: {data.location.district}</p>
      <p>Website: {data.website}</p>
    </div>
  );
}