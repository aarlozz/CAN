// LocationCascade.jsx
//
// Reusable Province → District → Municipality cascading dropdown.
// District options only load once a Province is picked; Municipality options
// only load once a District is picked — exactly the "pick province, then
// district shows, then municipality shows" behaviour that was requested.
//
// Two id modes:
//   idMode="id"   → value/onChange work with Mongo _id (used for filtering
//                   scholarships, where we query by provinceId/districtId/…)
//   idMode="name" → value/onChange work with plain name strings (used when
//                   posting a scholarship, where locationFilter is stored by
//                   name so it works even without picking exact DB ids)
//
// Usage:
//   <LocationCascade
//     idMode="id"
//     province={filters.provinceId}
//     district={filters.districtId}
//     municipality={filters.municipalityId}
//     onChange={({ province, district, municipality }) => { ... }}
//   />

import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const selectCls =
  "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed w-full";
const labelCls =
  "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block";

export default function LocationCascade({
  idMode = "id", // "id" | "name"
  province = "",
  district = "",
  municipality = "",
  onChange,
  gridClassName = "grid grid-cols-1 sm:grid-cols-3 gap-4",
  labels = { province: "Province", district: "District", municipality: "Municipality" },
}) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  // ── Load provinces once ─────────────────────────────────────────────────
  useEffect(() => {
    setLoadingProvinces(true);
    axios
      .get(`${API}/api/location/provinces`)
      .then((r) => setProvinces(r.data.provinces || []))
      .catch(() => {})
      .finally(() => setLoadingProvinces(false));
  }, []);

  // ── Resolve the province's _id whether we're in id or name mode ────────
  const selectedProvinceId =
    idMode === "id"
      ? province
      : provinces.find((p) => p.provinceName === province)?._id || "";

  const selectedDistrictId =
    idMode === "id"
      ? district
      : districts.find((d) => d.districtName === district)?._id || "";

  // ── Load districts when province changes ────────────────────────────────
  useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    axios
      .get(`${API}/api/location/districts?provinceId=${selectedProvinceId}`)
      .then((r) => setDistricts(r.data.districts || []))
      .catch(() => {})
      .finally(() => setLoadingDistricts(false));
  }, [selectedProvinceId]);

  // ── Load municipalities when district changes ───────────────────────────
  useEffect(() => {
    if (!selectedDistrictId) {
      setMunicipalities([]);
      return;
    }
    setLoadingMunicipalities(true);
    axios
      .get(`${API}/api/location/municipalities?districtId=${selectedDistrictId}`)
      .then((r) => setMunicipalities(r.data.municipalities || []))
      .catch(() => {})
      .finally(() => setLoadingMunicipalities(false));
  }, [selectedDistrictId]);

  const emit = (next) => {
    if (onChange) onChange(next);
  };

  const handleProvinceChange = (e) => {
    const val = e.target.value;
    if (idMode === "id") {
      emit({ province: val, district: "", municipality: "" });
    } else {
      const prov = provinces.find((p) => p._id === val);
      emit({
        province: prov?.provinceName || "",
        district: "",
        municipality: "",
      });
    }
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    if (idMode === "id") {
      emit({ province, district: val, municipality: "" });
    } else {
      const dist = districts.find((d) => d._id === val);
      emit({ province, district: dist?.districtName || "", municipality: "" });
    }
  };

  const handleMunicipalityChange = (e) => {
    const val = e.target.value;
    if (idMode === "id") {
      emit({ province, district, municipality: val });
    } else {
      const muni = municipalities.find((m) => m._id === val);
      emit({ province, district, municipality: muni?.municipalityName || "" });
    }
  };

  return (
    <div className={gridClassName}>
      <div>
        <label className={labelCls}>{labels.province}</label>
        <select
          className={selectCls}
          value={selectedProvinceId}
          onChange={handleProvinceChange}
          disabled={loadingProvinces}
        >
          <option value="">
            {loadingProvinces ? "Loading…" : "All Provinces"}
          </option>
          {provinces.map((p) => (
            <option key={p._id} value={p._id}>
              {p.provinceName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>{labels.district}</label>
        <select
          className={selectCls}
          value={selectedDistrictId}
          onChange={handleDistrictChange}
          disabled={!selectedProvinceId || loadingDistricts}
        >
          <option value="">
            {!selectedProvinceId
              ? "Select Province first"
              : loadingDistricts
                ? "Loading…"
                : "All Districts"}
          </option>
          {districts.map((d) => (
            <option key={d._id} value={d._id}>
              {d.districtName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>{labels.municipality}</label>
        <select
          className={selectCls}
          value={municipality}
          onChange={handleMunicipalityChange}
          disabled={!selectedDistrictId || loadingMunicipalities}
        >
          <option value="">
            {!selectedDistrictId
              ? "Select District first"
              : loadingMunicipalities
                ? "Loading…"
                : "All Municipalities"}
          </option>
          {municipalities.map((m) => (
            <option key={m._id} value={idMode === "id" ? m._id : m.municipalityName}>
              {m.municipalityName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
