import { useEffect, useState } from "react";

export default function InstitutionList() {

  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/institutions/all", {

      headers: {
        Authorization: `Bearer ${token}`
      }

    })
      .then(res => res.json())
      .then(data => setInstitutions(data.institutions));

  }, []);

  return (

    <div>

      <h3>Registered Institutions</h3>

      {institutions.map(inst => (

        <div key={inst._id}>

          <h4>{inst.institutionName}</h4>

          <p>{inst.institutionType}</p>

          <p>{inst.location?.province}</p>

        </div>

      ))}

    </div>

  );
}