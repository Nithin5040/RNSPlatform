// ProfileEdit.jsx
import React, { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient"; // optional - used if you want to fetch/save to API
import { useNavigate } from "react-router-dom";

/*
  ProfileEdit.jsx
  - Tailwind-based profile edit form, mobile responsive
  - Prefills from localStorage 'auth_user' if present
  - Replace axiosClient calls with real endpoints as needed
*/

const defaultProfile = {
  id: "",
  name: "",
  phone: "",
  email: "",
  gender: "Male",
  dob: "",
  bloodGroup: "",
  timezone: "(UTC+05:30) Asia/Kolkata",
  street: "",
  locality: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  extraPhone: "",
  language: "English",
  avatar: "", // data-url or url
};

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [profile, setProfile] = useState(defaultProfile);
  const [editingPhone, setEditingPhone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // load from localStorage -> instant UX
  useEffect(() => {
    try {
      const cached = localStorage.getItem("auth_user");
      if (cached) {
        const u = JSON.parse(cached);
        setProfile((p) => ({ ...p, ...u }));
      } else {
        // If you want to load from API, uncomment below
        // loadFromServer();
      }
    } catch (e) {
      // ignore parse
    }
  }, []);

  // optional: fetch latest from API
  async function loadFromServer() {
    try {
      const res = await axiosClient.get("/user");
      const u = res?.data?.user || res?.data || {};
      setProfile((p) => ({ ...p, ...u }));
      localStorage.setItem("auth_user", JSON.stringify({ ...p, ...u }));
    } catch (err) {
      console.warn("Could not refresh profile:", err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
    setErrors((s) => ({ ...s, [name]: undefined }));
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    setProfile((p) => ({ ...p, avatar: "" }));
    if (fileRef.current) fileRef.current.value = null;
  }

  function validate() {
    const errs = {};
    if (!profile.name || profile.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!profile.phone || profile.phone.trim().length < 8) errs.phone = "Invalid phone number.";
    // email optional but if provided, basic check:
    if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) errs.email = "Invalid email address.";
    // pincode optional but if present numeric:
    if (profile.pincode && !/^\d{3,10}$/.test(profile.pincode)) errs.pincode = "Invalid pincode.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      // Example: replace with your real API endpoint
      // const res = await axiosClient.post('/user/update', profile);
      // Simulate API latency:
      await new Promise((r) => setTimeout(r, 900));

      // update local cache for instant UX
      localStorage.setItem("auth_user", JSON.stringify(profile));
      setSaving(false);

      // show success and navigate back to dashboard / profile view
      alert("Profile saved successfully");
      navigate("/"); // or navigate('/profile-view') if you have a view page
    } catch (err) {
      setSaving(false);
      alert("Failed to save profile. Try again.");
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <button
            onClick={() => document.getElementById("profileForm").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
            className="bg-sky-500 text-white px-4 py-2 rounded"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        <form id="profileForm" onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* top row: avatar + name */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden border">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                    {profile.name ? profile.name.split(" ").map(n => n[0]).slice(0,2).join("") : "?"}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-600">Pick a photo from your computer</div>
                <div className="mt-2 flex items-center gap-3">
                  <label className="text-sm text-sky-600 cursor-pointer">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    Edit
                  </label>
                  <button type="button" onClick={removeAvatar} className="text-sm text-rose-500">Remove</button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Name*</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded px-3 py-2 ${errors.name ? "border-rose-500" : "border-gray-200"}`}
                required
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>
          </div>

          <hr />

          {/* Contact / basics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600">Phone number</label>
                <button type="button" onClick={() => setEditingPhone((s) => !s)} className="text-sm text-sky-600">
                  {editingPhone ? "Cancel" : "Edit"}
                </button>
              </div>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                readOnly={!editingPhone}
                className={`mt-1 block w-full border rounded px-3 py-2 ${errors.phone ? "border-rose-500" : "border-gray-200"} ${!editingPhone ? "bg-gray-50" : ""}`}
                required
              />
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600">Email Address</label>
                <span className="text-sm text-sky-600">Add</span>
              </div>
              <input
                name="email"
                value={profile.email}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded px-3 py-2 ${errors.email ? "border-rose-500" : "border-gray-200"}`}
                placeholder="Enter email (optional)"
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <select name="gender" value={profile.gender} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* dob / blood / timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Date of birth</label>
              <input name="dob" value={profile.dob} onChange={handleChange} type="date" className="mt-1 block w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="text-sm text-gray-600">Blood group</label>
              <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Timezone</label>
              <select name="timezone" value={profile.timezone} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2">
                <option>(UTC+05:30) Asia/Kolkata</option>
                <option>(UTC+05:30) Asia/Colombo</option>
                <option>(UTC+00:00) UTC</option>
                {/* add more as needed */}
              </select>
            </div>
          </div>

          <hr />

          {/* Address */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">House No. / Street Name / Area</label>
                <input name="street" value={profile.street} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Colony / Street / Locality</label>
                <input name="locality" value={profile.locality} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm text-gray-600">City</label>
                <input name="city" value={profile.city} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm text-gray-600">State</label>
                <input name="state" value={profile.state} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Country</label>
                <select name="country" value={profile.country} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2">
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Pincode</label>
                <input name="pincode" value={profile.pincode} onChange={handleChange} className={`mt-1 block w-full border rounded px-3 py-2 ${errors.pincode ? "border-rose-500" : ""}`} />
                {errors.pincode && <p className="text-xs text-rose-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>

          <hr />

          {/* Other info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Extra phone numbers</label>
              <input name="extraPhone" value={profile.extraPhone} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="text-sm text-gray-600">Language</label>
              <select name="language" value={profile.language} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2">
                <option>English</option>
                <option>Hindi</option>
                <option>Kannada</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>

          <div className="text-right">
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
